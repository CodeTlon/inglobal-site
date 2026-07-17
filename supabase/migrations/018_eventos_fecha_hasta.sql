-- Eventos que duran varios días seguidos (ej. una obra de una semana con la
-- misma grúa/operarios reservados todos esos días). NULL = evento de un solo
-- día, se sigue usando sólo `fecha` (comportamiento actual, sin cambios).
ALTER TABLE public.eventos_agenda
  ADD COLUMN fecha_hasta DATE;
