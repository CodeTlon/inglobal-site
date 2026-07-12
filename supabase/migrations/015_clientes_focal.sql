-- Clientes: foco del logo (ej. "30% 60%"), null = centro.
ALTER TABLE public.clientes
  ADD COLUMN logo_focal TEXT;
