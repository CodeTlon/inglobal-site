-- Grúas: campo "tipo" — el catálogo no son solo grúas de torre, también hidrogrúas y camiones.
ALTER TABLE public.gruas
  ADD COLUMN tipo TEXT NOT NULL DEFAULT 'Grúa';
