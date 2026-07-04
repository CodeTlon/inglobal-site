-- InGlobal — clientes
-- Migración 004: tabla de clientes con logos y ranking de destacados

-- =============================================================
-- 1. Tabla clientes
-- =============================================================
CREATE TABLE IF NOT EXISTS public.clientes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  logo        TEXT NOT NULL,
  bio         TEXT,
  content     TEXT,
  featured    BOOLEAN NOT NULL DEFAULT TRUE,
  work_rank   INT NOT NULL DEFAULT 0,
  published   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read clientes" ON public.clientes;
CREATE POLICY "Public can read clientes"
  ON public.clientes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated can write clientes" ON public.clientes;
CREATE POLICY "Authenticated can write clientes"
  ON public.clientes FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =============================================================
-- 2. Seed — 25 clientes de app/clientes/page.tsx
-- Los 10 del preview del home llevan work_rank alto (100→10 escalonado).
-- El resto lleva work_rank = 10 (bajo).
-- =============================================================
INSERT INTO public.clientes (slug, name, logo, bio, content, featured, work_rank) VALUES

  -- Clientes del preview del home (work_rank alto)
  (
    'aguas-cordobesas',
    'Aguas Cordobesas',
    '/images/logos/AGUASCORDOBESAS-logo.png',
    'Empresa líder en la prestación del servicio de agua potable en Córdoba Capital.',
    'Trabajamos junto a Aguas Cordobesas en operaciones de izaje y montaje industrial para el mantenimiento y expansión de su infraestructura de distribución de agua. Nuestros equipos certificados garantizaron cada operación con los más altos estándares de seguridad.',
    TRUE, 100
  ),
  (
    'bunge',
    'Bunge',
    '/images/logos/BUNGE-logo.png',
    'Multinacional del agro con importante presencia en la cadena de valor de granos y aceites vegetales.',
    'Trabajamos junto a Bunge en operaciones de izaje y montaje industrial para sus instalaciones de procesamiento agroindustrial. La precisión y la seguridad en cada maniobra fueron los pilares de nuestra colaboración.',
    TRUE, 90
  ),
  (
    'coca-cola',
    'Coca-Cola',
    '/images/logos/COCACOLA-logo.png',
    'Empresa global de bebidas con operaciones de producción en Argentina.',
    'Trabajamos junto a Coca-Cola en el mantenimiento e instalación de equipos dentro de sus plantas productivas. Cada operación se planificó respetando los estrictos protocolos de seguridad e higiene de la compañía.',
    TRUE, 80
  ),
  (
    'electro-ingenieria',
    'Electro Ingeniería',
    '/images/logos/ELECTROINGENIERIA-logo.png',
    'Empresa de ingeniería especializada en proyectos de infraestructura eléctrica y civil en Argentina.',
    'Trabajamos junto a Electro Ingeniería aportando servicios de izaje y logística pesada en proyectos de infraestructura eléctrica a lo largo del país. La coordinación eficiente fue clave para cumplir los plazos de cada proyecto.',
    TRUE, 70
  ),
  (
    'epec',
    'EPEC',
    '/images/logos/EPEC-logo.png',
    'Empresa Provincial de Energía de Córdoba, responsable de la distribución de energía eléctrica en la provincia.',
    'Trabajamos junto a EPEC en el montaje y mantenimiento de infraestructura eléctrica de alta tensión. Nuestros equipos y operadores certificados garantizaron el cumplimiento de todos los protocolos de seguridad eléctrica.',
    TRUE, 60
  ),
  (
    'holcim',
    'Holcim',
    '/images/logos/HOLCIM-logo.png',
    'Empresa global líder en materiales de construcción con plantas de cemento en Argentina.',
    'Trabajamos junto a Holcim en operaciones de izaje y reposicionamiento de equipos industriales dentro de sus plantas de producción de cemento. La experiencia en ambientes industriales complejos fue fundamental para el éxito de cada proyecto.',
    TRUE, 50
  ),
  (
    'roggio',
    'Roggio',
    '/images/logos/ROGGIO-logo.png',
    'Grupo empresarial argentino con presencia en construcción, servicios y concesiones viales.',
    'Trabajamos junto a Roggio en proyectos de construcción e infraestructura, aportando servicios de grúas y montaje industrial de precisión. La confianza construida a lo largo de los años es el mejor aval de nuestra relación comercial.',
    TRUE, 40
  ),
  (
    'grupo-edisur',
    'Grupo Edisur',
    '/images/logos/GRUPOEDISUR-logo.png',
    'Empresa desarrolladora inmobiliaria líder en Córdoba con proyectos residenciales y comerciales.',
    'Trabajamos junto a Grupo Edisur en el montaje de estructuras y elementos constructivos para sus desarrollos inmobiliarios en Córdoba. La agilidad y seguridad de nuestras operaciones contribuyeron al cumplimiento de los cronogramas de obra.',
    TRUE, 30
  ),
  (
    'grupo-proaco',
    'Grupo Proaco',
    '/images/logos/GRUPOPROACO-logo.png',
    'Empresa constructora con amplia trayectoria en proyectos de vivienda y urbanización en Córdoba.',
    'Trabajamos junto a Grupo Proaco aportando servicios de grúas y logística para sus proyectos de construcción en Córdoba. Nuestra rapidez de respuesta y la fiabilidad de nuestros equipos fueron factores determinantes en la elección.',
    TRUE, 20
  ),
  (
    'porta',
    'Porta',
    '/images/logos/PORTA-logo.png',
    'Empresa argentina con actividad en la producción de alcohol y biocombustibles.',
    'Trabajamos junto a Porta en operaciones de izaje y montaje en sus instalaciones industriales. Cada proyecto fue abordado con planificación técnica rigurosa y personal especializado.',
    TRUE, 10
  ),

  -- Resto de clientes (work_rank bajo)
  (
    'armoy',
    'Armoy',
    '/images/logos/ARMOY-logo.png',
    'Empresa con actividad en el sector industrial y de servicios en Argentina.',
    'Trabajamos junto a Armoy en operaciones de izaje y logística industrial, aportando soluciones confiables y seguras para sus necesidades operativas.',
    TRUE, 10
  ),
  (
    'bbc',
    'BBC',
    '/images/logos/BBC-logo.png',
    'Empresa con presencia en el sector industrial argentino.',
    'Trabajamos junto a BBC brindando servicios de grúas y montaje industrial con los más altos estándares de calidad y seguridad.',
    TRUE, 10
  ),
  (
    'enco',
    'ENCO',
    '/images/logos/ENCO-logo.png',
    'Empresa de servicios con actividad en el mercado industrial de Argentina.',
    'Trabajamos junto a ENCO en distintas operaciones de izaje y traslado de equipos, garantizando eficiencia y seguridad en cada maniobra.',
    TRUE, 10
  ),
  (
    'gama',
    'GAMA',
    '/images/logos/GAMA-logo.png',
    'Empresa con actividad en el sector productivo e industrial de Argentina.',
    'Trabajamos junto a GAMA en proyectos de montaje y posicionamiento de equipos industriales, con planificación técnica y ejecución segura.',
    TRUE, 10
  ),
  (
    'habika',
    'Habika',
    '/images/logos/HABIKA-logo.png',
    'Empresa con presencia en el mercado de la construcción y el desarrollo industrial.',
    'Trabajamos junto a Habika aportando servicios de elevación y logística pesada para sus proyectos de construcción e instalación industrial.',
    TRUE, 10
  ),
  (
    'hasa',
    'HASA',
    '/images/logos/HASA-logo.png',
    'Empresa industrial argentina con operaciones en el sector productivo.',
    'Trabajamos junto a HASA en operaciones de izaje y traslado de equipos, cumpliendo siempre con los plazos y estándares de seguridad acordados.',
    TRUE, 10
  ),
  (
    'horpas',
    'Horpas',
    '/images/logos/HORPAS-logo.png',
    'Empresa con actividad en el sector de la construcción en Argentina.',
    'Trabajamos junto a Horpas brindando servicios de grúas para sus obras de construcción, con operadores certificados y equipos en perfectas condiciones.',
    TRUE, 10
  ),
  (
    'infinito-open',
    'Infinito Open',
    '/images/logos/INFINITO-logo.png',
    'Empresa con presencia en el mercado de eventos y estructuras en Argentina.',
    'Trabajamos junto a Infinito Open en el montaje y desmontaje de estructuras para eventos, aportando precisión y seguridad en cada operación.',
    TRUE, 10
  ),
  (
    'ingenia',
    'Ingenia',
    '/images/logos/INGENIA-logo.png',
    'Empresa de ingeniería con actividad en proyectos industriales y de infraestructura.',
    'Trabajamos junto a Ingenia aportando servicios de izaje y logística pesada para sus proyectos de ingeniería, con soluciones adaptadas a cada requerimiento técnico.',
    TRUE, 10
  ),
  (
    'ivecor',
    'Ivecor',
    '/images/logos/IVECOR-logo.png',
    'Empresa con actividad en el sector industrial y automotriz de Argentina.',
    'Trabajamos junto a Ivecor en operaciones de montaje y posicionamiento de equipos dentro de sus instalaciones, garantizando la continuidad operativa durante cada intervención.',
    TRUE, 10
  ),
  (
    'lucy',
    'Lucy',
    '/images/logos/LUCY-logo.png',
    'Empresa con presencia en el mercado industrial argentino.',
    'Trabajamos junto a Lucy brindando servicios de grúas y montaje industrial con compromiso y responsabilidad en cada proyecto.',
    TRUE, 10
  ),
  (
    'quimex',
    'Quimex',
    '/images/logos/QUIMEX-logo.png',
    'Empresa del sector químico con operaciones industriales en Argentina.',
    'Trabajamos junto a Quimex en operaciones de izaje dentro de sus plantas químicas, cumpliendo con los protocolos de seguridad específicos del sector.',
    TRUE, 10
  ),
  (
    'siglo-21',
    'Siglo 21',
    '/images/logos/SIGLO21-logo.png',
    'Universidad privada con importante infraestructura edilicia en Córdoba.',
    'Trabajamos junto a Siglo 21 en el montaje de equipos e instalaciones para sus edificios, aportando precisión y cuidado en cada operación dentro del ámbito educativo.',
    TRUE, 10
  ),
  (
    'sullair',
    'Sullair',
    '/images/logos/SULLAIR-logo.png',
    'Empresa global especializada en compresores de aire industrial.',
    'Trabajamos junto a Sullair en el posicionamiento e instalación de equipos de compresión industrial, garantizando el correcto manejo de maquinaria de alto valor.',
    TRUE, 10
  ),
  (
    'tecsma',
    'Tecsma',
    '/images/logos/TECSMA-logo.png',
    'Empresa de ingeniería y servicios industriales con actividad en Argentina.',
    'Trabajamos junto a Tecsma aportando servicios de izaje y montaje para sus proyectos de ingeniería, con equipos certificados y personal especializado.',
    TRUE, 10
  )

ON CONFLICT (slug) DO NOTHING;
