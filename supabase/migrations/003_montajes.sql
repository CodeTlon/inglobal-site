-- InGlobal — montajes
-- Migración 003: tabla de proyectos/casos de éxito

-- =============================================================
-- 1. Tabla montajes
-- =============================================================
CREATE TABLE IF NOT EXISTS public.montajes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  excerpt       TEXT,
  content       TEXT,
  cover_image   TEXT,
  tags          TEXT[] NOT NULL DEFAULT '{}',
  display_order INT NOT NULL DEFAULT 0,
  published     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.montajes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read montajes" ON public.montajes;
CREATE POLICY "Public can read montajes"
  ON public.montajes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated can write montajes" ON public.montajes;
CREATE POLICY "Authenticated can write montajes"
  ON public.montajes FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =============================================================
-- 2. Seed con los 6 montajes actuales de app/montajes/page.tsx
-- =============================================================
INSERT INTO public.montajes (slug, title, excerpt, content, cover_image, tags, display_order) VALUES

  (
    'traslado-vagon-historico',
    'Traslado de Vagón Histórico',
    'Operación logística integral utilizando grúas telescópicas de alta capacidad para el posicionamiento de patrimonio ferroviario.',
    'El traslado del vagón histórico representó uno de los desafíos logísticos más singulares en nuestra trayectoria. La operación requirió el despliegue de grúas telescópicas de alta capacidad coordinadas con equipos de seguridad vial para movilizar la pieza sin afectar su integridad estructural.

La planificación contempló el relevamiento de la ruta, los radios de giro disponibles y los puntos de izaje más seguros para garantizar que el patrimonio ferroviario llegara a destino en condiciones impecables. El equipo de ingeniería elaboró un plan de rigging detallado con márgenes de seguridad amplios en cada maniobra.

El resultado fue un posicionamiento de precisión que respetó las indicaciones de los responsables del patrimonio cultural. Una operación que reafirma nuestra capacidad para abordar proyectos fuera de lo convencional con el mismo estándar de calidad y seguridad que aplicamos en la industria.',
    'igb-3',
    ARRAY['Córdoba', 'Telescópicas', 'Patrimonio'],
    0
  ),

  (
    'estructura-navidena-gigante',
    'Estructura Navideña Gigante',
    'Montaje de precisión en zona urbana. Trabajo nocturno coordinado con múltiples equipos de izaje y seguridad.',
    'El montaje de la estructura navideña gigante en pleno centro urbano exigió una planificación exhaustiva para minimizar el impacto sobre el tránsito y la seguridad de los transeúntes. La intervención se realizó en horario nocturno con cortes de calle coordinados con las autoridades municipales.

Múltiples equipos de izaje trabajaron de forma sincronizada para ensamblar los módulos de la estructura en el orden correcto, respetando las tolerancias de montaje indicadas por el fabricante. La iluminación especial de trabajo y los protocolos de señalización garantizaron condiciones seguras durante toda la operación.

Finalizado el trabajo al amanecer, la estructura quedó perfectamente nivelada y anclada, lista para ser instalada sin demoras adicionales. Un proyecto que demostró nuestra capacidad operativa en entornos urbanos complejos.',
    'igb-4',
    ARRAY['Eventos', 'Estructura', 'Izaje'],
    1
  ),

  (
    'instalacion-planta-industrial',
    'Instalación en Planta Industrial',
    'Posicionamiento de equipos de producción mediante maniobras coordinadas en espacios reducidos.',
    'La instalación de nuevos equipos de producción dentro de una planta industrial activa representó un reto logístico de primer nivel. El espacio disponible era reducido y la operación debía realizarse sin interrumpir los procesos productivos adyacentes.

Utilizamos una combinación de hidrogrúas y técnicas de rigging especializado para ingresar las máquinas a través de las aberturas existentes en la nave industrial. Cada maniobra fue planificada en detalle con el área de ingeniería de la planta para evitar interferencias con las instalaciones existentes.

El resultado fue la instalación precisa de todos los equipos en sus bases definitivas dentro del plazo acordado. La coordinación estrecha con el cliente garantizó que la producción se reanudara sin tiempos muertos adicionales.',
    'igb-5',
    ARRAY['Industrial', 'Planta', 'Precisión'],
    2
  ),

  (
    'silos-planta-petroquimica',
    'Silos en Planta Petroquímica',
    'Izaje y montaje de estructuras verticales de gran envergadura con personal especializado en altura.',
    'El montaje de silos en una planta petroquímica implicó cumplir con los más estrictos protocolos de seguridad industrial del sector. Antes de ingresar a las instalaciones, todo el personal completó las capacitaciones requeridas por el cliente y superó los controles de acceso correspondientes.

Las grúas telescópicas de gran capacidad fueron posicionadas estratégicamente para lograr el radio de izaje necesario sin interferir con las estructuras existentes. El montaje de cada silo se realizó en múltiples etapas, verificando la verticalidad y el torque de los bulones de anclaje en cada nivel.

El proyecto se completó dentro del plazo comprometido y sin registrar incidentes de seguridad. Una operación que reafirma nuestra experiencia en el sector petroquímico, donde los estándares de seguridad y precisión son condición indispensable.',
    'igb-10',
    ARRAY['Petroquímica', 'Silos', 'Montaje'],
    3
  ),

  (
    'tanque-industrial-gran-porte',
    'Tanque Industrial de Gran Porte',
    'Planificación técnica para el izaje de tanques en condiciones de espacio críticas. Ejecución impecable.',
    'El izaje de un tanque industrial de gran porte en un predio con espacio crítico requirió un estudio previo minucioso de las cargas sobre el suelo y la disposición de los equipos de grúas. El equipo técnico elaboró un plan de izaje con simulaciones de carga para validar la operación antes de iniciar los trabajos.

La ejecución se realizó con dos grúas telescópicas operando en tándem, coordinadas mediante comunicación directa entre los operadores y el rigger jefe. Cada fase del izaje fue supervisada con niveles láser para garantizar que el tanque permaneciera perfectamente horizontal durante el traslado y el descenso a su posición definitiva.

El trabajo finalizó con el tanque asentado con precisión milimétrica sobre sus apoyos, listo para ser conectado a las líneas de proceso. Una operación que ejemplifica el rigor técnico que aplicamos en cada proyecto de alta complejidad.',
    'igb-9',
    ARRAY['Industrial', 'Tanque', 'Izaje'],
    4
  ),

  (
    'estructura-metalica-altura',
    'Estructura Metálica de Altura',
    'Montaje simultáneo de pórticos metálicos para naves industriales de logística avanzada.',
    'El montaje de pórticos metálicos para una nave industrial de logística avanzada demandó la coordinación simultánea de múltiples equipos de grúas trabajando en distintos frentes de trabajo. La secuencia de montaje fue diseñada para optimizar los tiempos y garantizar la estabilidad estructural en cada etapa.

Los pórticos fueron izado uno a uno desde el área de acopio, transportados hasta su posición y ensamblados con los elementos de conexión correspondientes. El personal de altura trabajó en plataformas certificadas supervisando el apriete de cada unión y la alineación de los elementos antes de dar por finalizado cada pórtico.

El proyecto se entregó en plazo, con la totalidad de la estructura verificada y con certificados de calidad de los materiales y las uniones soldadas. Un trabajo que refleja la capacidad de InGlobal para gestionar proyectos de montaje a gran escala con eficiencia y seguridad.',
    'igb-8',
    ARRAY['Logística', 'Altura', 'Estructuras'],
    5
  )

ON CONFLICT (slug) DO NOTHING;
