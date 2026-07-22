-- InGlobal — servicios
-- Migración 005: tabla de servicios editables del sitio

-- =============================================================
-- 1. Tabla servicios
-- =============================================================
CREATE TABLE IF NOT EXISTS public.servicios (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  "desc"        TEXT NOT NULL DEFAULT '',
  specs         TEXT[] NOT NULL DEFAULT '{}',
  img           TEXT NOT NULL DEFAULT '',
  icon          TEXT NOT NULL DEFAULT '',
  display_order INT NOT NULL DEFAULT 0,
  published     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read servicios" ON public.servicios;
CREATE POLICY "Public can read servicios"
  ON public.servicios FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated can write servicios" ON public.servicios;
CREATE POLICY "Authenticated can write servicios"
  ON public.servicios FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =============================================================
-- 2. Seed con los 4 servicios actuales
--    (slugs = IDs usados hoy en app/page.tsx y app/servicios/page.tsx)
--    icon = nombre de lucide-react; el frontend lo mapea a componente
-- =============================================================
INSERT INTO public.servicios (slug, title, "desc", specs, img, icon, display_order) VALUES

  (
    'gruas-telescopicas',
    'Grúas Telescópicas',
    'Equipos de alta performance para elevación y movimiento de cargas pesadas en obras industriales y de construcción. Contamos con grúas de 3 a 200 toneladas de capacidad y hasta 100 metros de altura.',
    ARRAY['3 a 200 Tn de capacidad', 'Hasta 100m de altura', 'Certificación vigente', 'Operadores capacitados'],
    'igb-1',
    'ArrowUpToLine',
    0
  ),

  (
    'hidrogruas',
    'Hidrogrúas',
    'Hidrogrúas montadas con barquilla para trabajos en altura, mantenimiento industrial y montajes especiales. Ideales para acceder a zonas de difícil alcance con total seguridad.',
    ARRAY['Barquilla incluida', 'Acceso a zonas complejas', 'Mantenimiento industrial', 'Montajes especiales'],
    'igb-2',
    'HardHat',
    1
  ),

  (
    'movimientos-pesados',
    'Movimientos Pesados',
    'Trabajos especiales de movimiento y posicionamiento de estructuras de gran envergadura y peso considerable. Cada proyecto es planificado a medida según las necesidades del cliente.',
    ARRAY['Planificación personalizada', 'Estructuras de gran envergadura', 'Personal especializado', 'Seguridad certificada'],
    'igb-7',
    'Move',
    2
  ),

  (
    'traslados',
    'Traslados con Carretones',
    'Servicio de transporte de maquinarias y estructuras pesadas con carretones especializados a todo el país. Logística integral para garantizar que tu carga llegue en tiempo y forma.',
    ARRAY['Cobertura nacional', 'Maquinaria pesada', 'Carretones especializados', 'Logística integral'],
    'igb-3',
    'Truck',
    3
  )

ON CONFLICT (slug) DO NOTHING;
