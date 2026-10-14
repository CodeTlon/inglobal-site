-- Reglas de negocio que Drizzle no expresa. Copiadas tal cual del esquema real de produccion.
CREATE EXTENSION IF NOT EXISTS btree_gist;
--> statement-breakpoint
ALTER TABLE "empresas_agenda" ADD CONSTRAINT "empresas_agenda_tipo_check" CHECK ("tipo" = ANY (ARRAY['frecuente'::text, 'particular'::text]));
--> statement-breakpoint
ALTER TABLE "eventos_agenda" ADD CONSTRAINT "eventos_agenda_estado_valido" CHECK ("estado" = ANY (ARRAY['reserva'::text, 'programado'::text, 'en_curso'::text, 'finalizado'::text, 'cancelado'::text]));
--> statement-breakpoint
ALTER TABLE "tv_pairing_codes" ADD CONSTRAINT "tv_pairing_codes_status_check" CHECK ("status" = ANY (ARRAY['pending'::text, 'approved'::text, 'consumed'::text, 'expired'::text]));
--> statement-breakpoint
ALTER TABLE "galeria" ADD CONSTRAINT "galeria_col_span_desktop_check" CHECK ("col_span_desktop" >= 1 AND "col_span_desktop" <= 4);
--> statement-breakpoint
ALTER TABLE "galeria" ADD CONSTRAINT "galeria_col_span_mobile_check" CHECK ("col_span_mobile" >= 1 AND "col_span_mobile" <= 2);
--> statement-breakpoint
ALTER TABLE "galeria" ADD CONSTRAINT "galeria_row_span_desktop_check" CHECK ("row_span_desktop" >= 1 AND "row_span_desktop" <= 2);
--> statement-breakpoint
ALTER TABLE "galeria" ADD CONSTRAINT "galeria_row_span_mobile_check" CHECK ("row_span_mobile" >= 1 AND "row_span_mobile" <= 2);
--> statement-breakpoint
ALTER TABLE ONLY "public"."eventos_agenda"
    ADD CONSTRAINT "eventos_agenda_grua_no_overlap" EXCLUDE USING "gist" ("grua_id" WITH =, "tsrange"(("fecha" + "hora_inicio"), ((COALESCE("fecha_hasta", "fecha") + COALESCE("hora_fin", '23:59:00'::time without time zone)) +
CASE
    WHEN (("fecha_hasta" IS NULL) AND ("hora_fin" IS NOT NULL) AND ("hora_fin" <= "hora_inicio")) THEN '1 day'::interval
    ELSE '00:00:00'::interval
END), '[)'::"text") WITH &&) WHERE (("estado" <> 'cancelado'::"text"));
--> statement-breakpoint
CREATE OR REPLACE FUNCTION "public"."chequear_solapamiento_operario"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  ventana_inicio TIMESTAMP;
  ventana_fin    TIMESTAMP;
  conflicto_id   UUID;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.operario_id::text, 0));

  SELECT
    (fecha + hora_inicio),
    (
      COALESCE(fecha_hasta, fecha) + COALESCE(hora_fin, '23:59'::time)
      + CASE
          WHEN fecha_hasta IS NULL AND hora_fin IS NOT NULL AND hora_fin <= hora_inicio
          THEN interval '1 day'
          ELSE interval '0'
        END
    )
    INTO ventana_inicio, ventana_fin
    FROM public.eventos_agenda
    WHERE id = NEW.evento_id;

  IF ventana_inicio IS NULL THEN
    RETURN NEW; -- el evento no existe todavía visible en esta transacción; la FK igual lo exige
  END IF;

  SELECT eo.evento_id INTO conflicto_id
    FROM public.eventos_operarios eo
    JOIN public.eventos_agenda ea ON ea.id = eo.evento_id
    WHERE eo.operario_id = NEW.operario_id
      AND eo.evento_id <> NEW.evento_id
      AND ea.estado <> 'cancelado'
      AND tsrange(
            (ea.fecha + ea.hora_inicio),
            (
              COALESCE(ea.fecha_hasta, ea.fecha) + COALESCE(ea.hora_fin, '23:59'::time)
              + CASE
                  WHEN ea.fecha_hasta IS NULL AND ea.hora_fin IS NOT NULL AND ea.hora_fin <= ea.hora_inicio
                  THEN interval '1 day'
                  ELSE interval '0'
                END
            ),
            '[)'
          )
          && tsrange(ventana_inicio, ventana_fin, '[)')
    LIMIT 1;

  IF conflicto_id IS NOT NULL THEN
    RAISE EXCEPTION 'El operario ya está asignado a otro evento en ese horario.' USING ERRCODE = '23P01';
  END IF;

  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE OR REPLACE TRIGGER "trg_chequear_solapamiento_operario" BEFORE INSERT ON "public"."eventos_operarios" FOR EACH ROW EXECUTE FUNCTION "public"."chequear_solapamiento_operario"();
