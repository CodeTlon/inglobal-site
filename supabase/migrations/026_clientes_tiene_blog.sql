-- InGlobal — clientes
-- Migración 026: toggle explícito de blog (antes se inferría de `content` no vacío)

ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS tiene_blog BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE public.clientes SET tiene_blog = TRUE WHERE content IS NOT NULL AND trim(content) <> '';
