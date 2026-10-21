CREATE TABLE "eventos_gruas" (
	"evento_id" uuid NOT NULL,
	"grua_id" uuid NOT NULL,
	"orden" smallint DEFAULT 0 NOT NULL,
	CONSTRAINT "eventos_gruas_evento_id_grua_id_pk" PRIMARY KEY("evento_id","grua_id")
);
--> statement-breakpoint
ALTER TABLE "eventos_gruas" ADD CONSTRAINT "eventos_gruas_evento_id_eventos_agenda_id_fk" FOREIGN KEY ("evento_id") REFERENCES "public"."eventos_agenda"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos_gruas" ADD CONSTRAINT "eventos_gruas_grua_id_gruas_id_fk" FOREIGN KEY ("grua_id") REFERENCES "public"."gruas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "eventos_gruas_grua_id_idx" ON "eventos_gruas" USING btree ("grua_id");--> statement-breakpoint
-- Backfill: cada servicio existente conserva su grúa de siempre como grúa principal (orden 0).
-- Va ANTES del trigger a propósito: el historial puede tener solapamientos que el trigger rechazaría.
INSERT INTO "eventos_gruas" ("evento_id", "grua_id", "orden")
SELECT "id", "grua_id", 0 FROM "eventos_agenda" WHERE "grua_id" IS NOT NULL
ON CONFLICT DO NOTHING;
--> statement-breakpoint
-- Anti-solapamiento por grúa (mismo patrón y ventana que chequear_solapamiento_operario, de la 0001).
-- Un evento cancelado no ocupa la grúa: si el evento NUEVO está cancelado no se chequea nada.
CREATE OR REPLACE FUNCTION "public"."chequear_solapamiento_grua"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  ventana_inicio TIMESTAMP;
  ventana_fin    TIMESTAMP;
  estado_nuevo   TEXT;
  conflicto_id   UUID;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.grua_id::text, 1));

  SELECT
    (fecha + hora_inicio),
    (
      COALESCE(fecha_hasta, fecha) + COALESCE(hora_fin, '23:59'::time)
      + CASE
          WHEN fecha_hasta IS NULL AND hora_fin IS NOT NULL AND hora_fin <= hora_inicio
          THEN interval '1 day'
          ELSE interval '0'
        END
    ),
    estado
    INTO ventana_inicio, ventana_fin, estado_nuevo
    FROM public.eventos_agenda
    WHERE id = NEW.evento_id;

  IF ventana_inicio IS NULL OR estado_nuevo = 'cancelado' THEN
    RETURN NEW;
  END IF;

  SELECT eg.evento_id INTO conflicto_id
    FROM public.eventos_gruas eg
    JOIN public.eventos_agenda ea ON ea.id = eg.evento_id
    WHERE eg.grua_id = NEW.grua_id
      AND eg.evento_id <> NEW.evento_id
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
    RAISE EXCEPTION 'La grúa ya está asignada a otro evento en ese horario.' USING ERRCODE = '23P01';
  END IF;

  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE OR REPLACE TRIGGER "trg_chequear_solapamiento_grua" BEFORE INSERT ON "public"."eventos_gruas" FOR EACH ROW EXECUTE FUNCTION "public"."chequear_solapamiento_grua"();
