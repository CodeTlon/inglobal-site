-- Montajes y trabajos: imagen de banner (detalle) separada de la de portada (card de listado).
-- cover_image sigue siendo la miniatura del listado; banner_image es la foto grande detrás del título.
ALTER TABLE public.montajes
  ADD COLUMN banner_image TEXT,
  ADD COLUMN banner_image_focal TEXT;

ALTER TABLE public.trabajos
  ADD COLUMN banner_image TEXT,
  ADD COLUMN banner_image_focal TEXT;
