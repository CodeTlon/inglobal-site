-- Segundo punto de foco para mobile, además del de desktop (ej. "30% 60%"),
-- null = usa el mismo foco que desktop. Mismos 5 campos que ya soportan foco.
ALTER TABLE public.montajes
  ADD COLUMN cover_image_focal_mobile TEXT,
  ADD COLUMN banner_image_focal_mobile TEXT;

ALTER TABLE public.trabajos
  ADD COLUMN cover_image_focal_mobile TEXT,
  ADD COLUMN banner_image_focal_mobile TEXT;

ALTER TABLE public.clientes
  ADD COLUMN logo_focal_mobile TEXT;
