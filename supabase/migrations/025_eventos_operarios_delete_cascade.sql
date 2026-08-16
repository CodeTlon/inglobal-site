-- Borrar un operario nunca debe bloquear ni borrar el evento al que estuvo
-- asignado — solo debe desasignarlo. La fila de eventos_agenda no se toca
-- (evento_id sigue ON DELETE CASCADE contra eventos_agenda, sin cambios acá);
-- lo único que cambia es que la fila puente eventos_operarios se borra en
-- cascada cuando se borra el operario, en vez de bloquear el delete con
-- ON DELETE RESTRICT como hasta ahora.
ALTER TABLE public.eventos_operarios
  DROP CONSTRAINT IF EXISTS eventos_operarios_operario_id_fkey,
  ADD CONSTRAINT eventos_operarios_operario_id_fkey
    FOREIGN KEY (operario_id) REFERENCES public.operarios(id) ON DELETE CASCADE;
