-- Cierra un race condition de "check-then-insert": buscarConflicto() (lib/agenda-business.ts)
-- hace un SELECT + comparación en memoria en la app, y el INSERT/UPDATE de eventos_agenda
-- (y el INSERT de eventos_operarios) son statements aparte — dos POST simultáneos a
-- /api/agenda/eventos (o dos submits del form del dashboard) para la misma grúa u operario
-- en ventanas de fecha/hora solapadas pueden pasar la validación los dos, porque ninguno ve
-- todavía el insert del otro, y terminar con la grúa/operario doble-reservado (mismo patrón
-- de "oversell" que un check-then-reserve sin lock sobre stock/turnos). La validación en
-- TypeScript queda (da el mensaje lindo en el caso común, sin race), pero la garantía real
-- pasa a ser esta constraint/trigger a nivel de base, que sí es atómica.

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- `estado` nunca tuvo un CHECK a nivel de base (solo el enum de Zod en la app) —
-- un cliente autenticado que le pegue directo a PostgREST (bypaseando el Route
-- Handler/Server Action y su validación) podía dejar la fila en cualquier string.
-- No es una escalada de permisos (ya se requiere estar autenticado para tocar esta
-- tabla, por diseño: admin y trabajador comparten acceso), pero conviene que la
-- base sea la fuente de verdad de los valores válidos, no solo el schema de Zod.
ALTER TABLE public.eventos_agenda
  ADD CONSTRAINT eventos_agenda_estado_valido
  CHECK (estado IN ('reserva', 'programado', 'en_curso', 'finalizado', 'cancelado'));

-- Grúa: mismo grua_id no puede tener dos eventos no cancelados con rango fecha+hora
-- solapado. Rango half-open '[)' == mismo criterio que rangosSeSolapan() en TS
-- (a.inicio < b.fin && b.inicio < a.fin): dos eventos "back to back" (uno termina
-- justo cuando el otro empieza) NO cuentan como solapados.
ALTER TABLE public.eventos_agenda
  ADD CONSTRAINT eventos_agenda_grua_no_overlap
  EXCLUDE USING gist (
    grua_id WITH =,
    tsrange(
      (fecha + hora_inicio),
      (COALESCE(fecha_hasta, fecha) + COALESCE(hora_fin, '23:59'::time)),
      '[)'
    ) WITH &&
  )
  WHERE (estado <> 'cancelado');

-- Operario: vive en la tabla puente eventos_operarios (many-to-many) — no tiene las
-- columnas de fecha/hora, así que no se puede expresar como EXCLUDE constraint directo.
-- Se resuelve con un trigger que toma un advisory lock por operario (serializa inserts
-- concurrentes del mismo operario contra esta validación) y repite el mismo chequeo de
-- solapamiento contra eventos_agenda antes de aceptar la fila.
CREATE OR REPLACE FUNCTION public.chequear_solapamiento_operario() RETURNS TRIGGER AS $$
DECLARE
  ventana_inicio TIMESTAMP;
  ventana_fin    TIMESTAMP;
  conflicto_id   UUID;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.operario_id::text, 0));

  SELECT (fecha + hora_inicio), (COALESCE(fecha_hasta, fecha) + COALESCE(hora_fin, '23:59'::time))
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
      AND tsrange((ea.fecha + ea.hora_inicio), (COALESCE(ea.fecha_hasta, ea.fecha) + COALESCE(ea.hora_fin, '23:59'::time)), '[)')
          && tsrange(ventana_inicio, ventana_fin, '[)')
    LIMIT 1;

  IF conflicto_id IS NOT NULL THEN
    RAISE EXCEPTION 'El operario ya está asignado a otro evento en ese horario.' USING ERRCODE = '23P01';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_chequear_solapamiento_operario ON public.eventos_operarios;
CREATE TRIGGER trg_chequear_solapamiento_operario
  BEFORE INSERT ON public.eventos_operarios
  FOR EACH ROW EXECUTE FUNCTION public.chequear_solapamiento_operario();
