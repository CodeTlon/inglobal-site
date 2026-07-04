-- InGlobal — site_settings
-- Migración 002: tabla de configuración editable del sitio (key/value JSON)

-- =============================================================
-- 1. Tabla site_settings
-- =============================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read site_settings" ON public.site_settings;
CREATE POLICY "Public can read site_settings"
  ON public.site_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated can write site_settings" ON public.site_settings;
CREATE POLICY "Authenticated can write site_settings"
  ON public.site_settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =============================================================
-- 2. Seed con contenido actual del sitio
-- =============================================================
INSERT INTO public.site_settings (key, value) VALUES

  -- Hero (app/page.tsx — sección HERO)
  ('hero', jsonb_build_object(
    'title',          'Elevando tus proyectos con seguridad y precisión.',
    'subtitle',       'Líderes en alquiler de grúas y montajes industriales de alta complejidad. Operadores y equipos certificados en toda Argentina.',
    'video_url',      NULL,
    'fallback_image', 'igb-3'
  )),

  -- Stats (app/page.tsx — los 3 stats del hero)
  ('stats', jsonb_build_array(
    jsonb_build_object('number', '40+',  'label', 'Años de experiencia'),
    jsonb_build_object('number', '200',  'label', 'Toneladas de capacidad'),
    jsonb_build_object('number', '100m', 'label', 'Altura máxima')
  )),

  -- Quiénes Somos (app/page.tsx — sección ABOUT)
  ('quienes_somos', jsonb_build_object(
    'label',  'Quiénes Somos',
    'title',  'Grúas InGlobal S.R.L.',
    'p1',     'Somos Inglobal, una empresa líder en movimientos especiales pesados y montajes industriales. Como continuadores de una empresa familiar con más de 40 años de trayectoria, combinamos experiencia técnica con un compromiso inquebrantable hacia nuestros clientes.',
    'p2',     'Ofrecemos el alquiler de grúas, hidrogrúas, transporte y maquinaria pesada en todo el país. Nos respaldan operadores y equipos certificados, garantizando que cada operación cumpla con los más altos estándares de seguridad y eficiencia.',
    'image',  'igb-2'
  )),

  -- Qué Hacemos (app/page.tsx — sección SERVICES PREVIEW)
  ('que_hacemos', jsonb_build_object(
    'label',    'Excelencia Operativa',
    'title',    'Ingeniería en Movimiento',
    'subtitle', 'Ofrecemos el alquiler de diferentes equipos para dar solución a las necesidades de nuestros clientes.'
  )),

  -- CTA Banner (app/page.tsx — sección CTA BANNER)
  ('cta_banner', jsonb_build_object(
    'title',    'Ingeniería aplicada a montajes complejos',
    'subtitle', 'Soluciones logísticas y de izaje para los desafíos más exigentes de la industria.',
    'bg_image', 'igb-10'
  )),

  -- Clientes Destacados (app/page.tsx — sección CLIENTS)
  ('clientes_destacados', jsonb_build_object(
    'label',    'Confían en nosotros',
    'title',    'Clientes Destacados',
    'subtitle', 'Empresas líderes que avalan nuestro compromiso y responsabilidad.'
  )),

  -- Ubicación (app/page.tsx — sección LOCATION)
  ('ubicacion', jsonb_build_object(
    'label',    'Dónde Encontrarnos',
    'title',    'Nuestra Ubicación',
    'subtitle', 'Acercate a nuestras oficinas o contactanos para planificar tu próximo movimiento.'
  )),

  -- Footer (components/Footer.tsx)
  ('footer', jsonb_build_object(
    'brand_text', 'Soluciones de elevación y logística pesada para los desafíos más exigentes del mercado industrial. Más de 40 años de trayectoria en Argentina.',
    'phone',      '0351 345-4244',
    'phone_href', 'tel:03513454244',
    'address',    'Ana Riglos de Irigoyen S/N, Córdoba, Argentina',
    'email',      'info@gruasinglobal.com',
    'horario',    'Lun-Vie 8-18h / Sáb 8-13h'
  )),

  -- Contacto (app/contacto/page.tsx)
  ('contacto', jsonb_build_object(
    'label',          'Contacto Directo',
    'title',          'Hablemos de su próximo proyecto.',
    'subtitle',       'Asesoramiento técnico especializado para operaciones de alta complejidad.',
    'ubicacion_label','Nuestra Ubicación',
    'ubicacion',      'Ana Riglos de Irigoyen S/N, Córdoba, Argentina',
    'horario_label',  'Horarios de Atención',
    'horario',        'Lun-Vie 8:00 — 18:00h / Sáb 8:00 — 13:00h',
    'phone',          '0351 345-4244',
    'phone_href',     'tel:03513454244',
    'email',          'info@gruasinglobal.com'
  ))

ON CONFLICT (key) DO NOTHING;
