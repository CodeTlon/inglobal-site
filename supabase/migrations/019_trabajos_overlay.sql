-- Overlay del banner de trabajos editable (desktop/mobile por separado), mismo
-- criterio que hero.overlay_opacity. Default 100 = look actual, sin cambios.
ALTER TABLE public.trabajos
  ADD COLUMN banner_overlay_opacity INT NOT NULL DEFAULT 100,
  ADD COLUMN banner_overlay_opacity_mobile INT;
