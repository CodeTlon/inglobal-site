-- InGlobal — trabajos por cliente
-- Migración 007: cada cliente puede tener varios "trabajos" (artículos internos,
-- uno por proyecto/obra realizado). La página /clientes/[slug] se comporta como
-- un mini-blog cuando tiene trabajos cargados.

CREATE TABLE IF NOT EXISTS public.trabajos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id    UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  slug          TEXT NOT NULL,
  title         TEXT NOT NULL,
  excerpt       TEXT,
  content       TEXT NOT NULL DEFAULT '',
  cover_image   TEXT,
  youtube_url   TEXT,
  display_order INT NOT NULL DEFAULT 0,
  published     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cliente_id, slug)
);

CREATE INDEX IF NOT EXISTS trabajos_cliente_id_idx ON public.trabajos(cliente_id);

ALTER TABLE public.trabajos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read trabajos" ON public.trabajos;
CREATE POLICY "Public can read trabajos"
  ON public.trabajos FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated can write trabajos" ON public.trabajos;
CREATE POLICY "Authenticated can write trabajos"
  ON public.trabajos FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
