-- InGlobal — servicios
-- Migración 008: descripción corta (cards del home) separada de la detallada

ALTER TABLE public.servicios
  ADD COLUMN IF NOT EXISTS excerpt TEXT NOT NULL DEFAULT '';

-- Backfill: recorta la descripción detallada existente como punto de partida
-- editable desde el dashboard, para no dejar las cards del home vacías.
-- 80 = límite real que entra en 2 líneas de la card en el breakpoint más
-- angosto (grid de 4 columnas, viewport 1280px de los tests E2E).
UPDATE public.servicios
SET excerpt = left("desc", 80)
WHERE excerpt = '';
