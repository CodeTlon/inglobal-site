-- Montajes: foco de la imagen de portada (ej. "30% 60%"), null = centro.
ALTER TABLE public.montajes
  ADD COLUMN cover_image_focal TEXT;
