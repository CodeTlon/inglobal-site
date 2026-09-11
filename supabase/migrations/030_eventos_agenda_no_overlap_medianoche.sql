-- 024_eventos_agenda_no_overlap.sql calculaba el fin de la ventana de un evento
-- como `COALESCE(fecha_hasta, fecha) + COALESCE(hora_fin, '23:59')` — para un
-- turno nocturno SIN `fecha_hasta` explícita (ej. 22:00→02:00, mismo `fecha`)
-- eso da un instante de fin en el MISMO día, antes que el de inicio (02:00 <
-- 22:00). Un `tsrange(lower, upper)` con `lower > upper` no es un rango
-- invertido silencioso: Postgres tira `range lower bound must be less than or
-- equal to range upper bound` — hoy queda enmascarado porque
-- lib/validations/agenda.ts rechaza ese evento ANTES de llegar a la base (con
-- el mensaje, incorrecto, de "duración mínima"); en cuanto se arregla esa
-- validación para aceptar el turno nocturno, el INSERT llega hasta acá y
-- rompe con un 500 en vez del 400 de antes.
--
-- La misma cuenta vive por triplicado (constraint de grúa acá abajo, trigger
-- de operario, y `rangosSeSolapan`/`estadoTransicionado` en
-- lib/agenda-business.ts, ya corregidas por separado) — todas necesitan el
-- mismo criterio: si no hay `fecha_hasta` y `hora_fin` quedó <= `hora_inicio`,
-- el fin real cae al día siguiente.

ALTER TABLE public.eventos_agenda
  DROP CONSTRAINT eventos_agenda_grua_no_overlap;

ALTER TABLE public.eventos_agenda
  ADD CONSTRAINT eventos_agenda_grua_no_overlap
  EXCLUDE USING gist (
    grua_id WITH =,
    tsrange(
      (fecha + hora_inicio),
      (
        COALESCE(fecha_hasta, fecha) + COALESCE(hora_fin, '23:59'::time)
        + CASE
            WHEN fecha_hasta IS NULL AND hora_fin IS NOT NULL AND hora_fin <= hora_inicio
            THEN interval '1 day'
            ELSE interval '0'
          END
      ),
      '[)'
    ) WITH &&
  )
  WHERE (estado <> 'cancelado');

CREATE OR REPLACE FUNCTION public.chequear_solapamiento_operario() RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;
-- CREATE OR REPLACE conserva el trigger existente (trg_chequear_solapamiento_operario,
-- creado en 024), no hace falta recrearlo.
