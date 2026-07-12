-- Trabajos: foco de la imagen de portada (ej. "30% 60%"), null = centro.
ALTER TABLE public.trabajos
  ADD COLUMN cover_image_focal TEXT;
