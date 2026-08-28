-- Permite borrar una grúa/empresa que ya no tiene eventos vivos (reserva/
-- programado/en_curso) asociados, aunque tenga historial (finalizado/
-- cancelado). Antes grua_id/empresa_id eran NOT NULL con ON DELETE RESTRICT,
-- así que la base bloqueaba el borrado sin importar el estado del evento.
-- Con SET NULL el evento histórico sobrevive, solo pierde la referencia
-- (el cliente muestra "Grúa eliminada"/"Empresa eliminada" cuando es null).
-- catalogDelete (lib/agenda-business.ts) sigue bloqueando si hay eventos
-- vivos, así que en la práctica el SET NULL solo pega sobre historial.

ALTER TABLE public.eventos_agenda
  ALTER COLUMN grua_id DROP NOT NULL,
  ALTER COLUMN empresa_id DROP NOT NULL;

ALTER TABLE public.eventos_agenda
  DROP CONSTRAINT eventos_agenda_grua_id_fkey,
  DROP CONSTRAINT eventos_agenda_empresa_id_fkey;

ALTER TABLE public.eventos_agenda
  ADD CONSTRAINT eventos_agenda_grua_id_fkey
    FOREIGN KEY (grua_id) REFERENCES public.gruas(id) ON DELETE SET NULL,
  ADD CONSTRAINT eventos_agenda_empresa_id_fkey
    FOREIGN KEY (empresa_id) REFERENCES public.empresas_agenda(id) ON DELETE SET NULL;
