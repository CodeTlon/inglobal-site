-- Trabajos: fecha del trabajo realizado (nullable, no todos los trabajos viejos la tienen cargada).
ALTER TABLE public.trabajos
  ADD COLUMN fecha DATE;
