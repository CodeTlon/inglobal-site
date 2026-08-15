/**
 * Fallbacks estáticos — mismos datos que el seed de las migraciones SQL.
 * content.ts los usa cuando Supabase no está configurado o falla.
 */

import type { Montaje, Cliente, Servicio, Galeria } from '@/lib/content'

// ─────────────────────────────────────────────────────────────
// site_settings fallbacks
// ─────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FALLBACK_SITE_SETTINGS: Record<string, any> = {
  hero: {
    headline:       'Elevando tus proyectos con seguridad y precisión.',
    subheadline:    'Líderes en alquiler de grúas y montajes industriales de alta complejidad. Operadores y equipos certificados en toda Argentina.',
    cta_primary:    'Solicitar Presupuesto',
    cta_secondary:  'Ver Servicios',
    video_url:        '/videos/opt/hero-desktop.mp4', // horizontal, video real del cliente (montaje/desmontaje), para md+
    video_url_mobile: '/videos/opt/hero-mobile.mp4', // vertical, video real del cliente (montaje/desmontaje), para <md
    fallback_image: 'igb-3',
  },
  stats: {
    items: [
      { number: '40+',  label: 'Años de experiencia' },
      { number: '200t', label: 'Toneladas de capacidad' },
      { number: '100m', label: 'Altura máxima' },
    ],
  },
  quienes_somos: {
    label:        'Quiénes Somos',
    heading:      'Grúas InGlobal S.R.L.',
    subheading:   'Más de 40 años acompañando a la industria argentina con soluciones de elevación y logística pesada.',
    company_name: 'Inglobal',
    description1: 'Somos Inglobal, una empresa líder en movimientos especiales pesados y montajes industriales. Como continuadores de una empresa familiar con más de 40 años de trayectoria, combinamos experiencia técnica con un compromiso inquebrantable hacia nuestros clientes.',
    description2: 'Ofrecemos el alquiler de grúas, hidrogrúas, transporte y maquinaria pesada en todo el país. Nos respaldan operadores y equipos certificados, garantizando que cada operación cumpla con los más altos estándares de seguridad y eficiencia.',
    image:        'igb-2',
    features: [
      'Operadores y equipos certificados en todo el país',
      'Rapidez, seguridad, costo y calidad como diferencial',
      'Nuestros clientes nos eligen una y otra vez',
    ],
  },
  que_hacemos: {
    label:      'Excelencia Operativa',
    heading:    'Ingeniería en Movimiento',
    subheading: 'Ofrecemos el alquiler de diferentes equipos para dar solución a las necesidades de nuestros clientes.',
  },
  cta_banner: {
    heading:          'Ingeniería aplicada a montajes complejos',
    subheading:       'Soluciones logísticas y de izaje para los desafíos más exigentes de la industria.',
    cta_primary:      'Solicitar Cotización',
    cta_secondary:    'Ver Montajes',
    background_image: 'igb-10',
  },
  clientes_destacados: {
    label:      'Confían en nosotros',
    heading:    'Clientes Destacados',
    subheading: 'Empresas líderes que avalan nuestro compromiso y responsabilidad.',
  },
  ubicacion: {
    label:      'Dónde Encontrarnos',
    heading:    'Nuestra Ubicación',
    subheading: 'Acercate a nuestras oficinas o contactanos para planificar tu próximo movimiento.',
  },
  footer: {
    description: 'Soluciones de elevación y logística pesada para los desafíos más exigentes del mercado industrial. Más de 40 años de trayectoria en Argentina.',
    phone:       '0351 345-4244',
    address:     'Ana Riglos de Irigoyen S/N, Córdoba, Argentina',
    email:       'info@gruasinglobal.com',
    hours:       'Lun-Vie 8-18h / Sáb 8-13h',
  },
  contacto: {
    address:        'Ana Riglos de Irigoyen S/N, Córdoba, Argentina',
    hours_weekday:  'Lun-Vie 8:00 — 18:00h',
    hours_saturday: 'Sáb 8:00 — 13:00h',
    phone:          '0351 345-4244',
    email:          'info@gruasinglobal.com',
  },
  dashboard_quicklinks: {
    items: [
      '/dashboard/contenido/hero',
      '/dashboard/contenido/footer',
      '/dashboard/contenido/stats',
      '/dashboard/montajes/nuevo',
      '/dashboard/clientes/nuevo',
    ],
  },
  servicios_header: {
    label:          'Nuestras Soluciones',
    heading:        'Nuestros Servicios',
    subheading:     'Soluciones de ingeniería en movimiento con equipos certificados y operadores expertos en toda Argentina.',
    cta_heading:    '¿Listo para comenzar su proyecto?',
    cta_subheading: 'Asesoramiento técnico personalizado para cada necesidad de izaje.',
    cta_button:     'Solicitar Presupuesto',
  },
  montajes_header: {
    label:          'Portafolio de Proyectos',
    heading:        'Casos de Éxito',
    subheading:     'Ingeniería aplicada a desafíos complejos. Cada proyecto es un testimonio de nuestra precisión técnica y compromiso con la seguridad.',
    cta_heading:    '¿Tu proyecto es el próximo desafío?',
    cta_subheading: 'Contactanos para recibir asesoramiento técnico especializado y presupuesto a medida.',
    cta_button:     'Consultanos ahora',
  },
  galeria_header: {
    label:          'Nuestros Proyectos en Imágenes',
    heading:        'Portafolio Operativo',
    subheading:     'Soluciones de ingeniería en movimiento con equipos certificados y operadores expertos en toda Argentina.',
    cta_heading:    '¿Su proyecto requiere esta precisión?',
    cta_subheading: 'Llevamos nuestra experiencia técnica y seguridad certificada a su próximo desafío industrial.',
    cta_button:     'Solicitar Presupuesto',
  },
  clientes_cta: {
    heading:    '¿Querés trabajar con nosotros?',
    subheading: 'Somos una PyME con una gran fortaleza humana donde construimos relaciones comerciales excelentes y duraderas.',
    button:     'Contactar ahora',
  },
  contacto_header: {
    label:          'Contacto Directo',
    heading:        'Hablemos de su\npróximo proyecto.',
    subheading:     'Asesoramiento técnico especializado para operaciones de alta complejidad.',
    form_title:     'Envianos tu consulta',
    form_subtitle:  'Complete el formulario y un asesor técnico le responderá a la brevedad.',
    whatsapp:       'https://wa.me/5493513454244',
    instagram:      'https://www.instagram.com/gruasinglobal',
    map_label:      'Dónde Encontrarnos',
    map_heading:    'Nuestra Ubicación',
    map_subheading: 'Acercate a nuestras oficinas o contactanos para planificar tu próximo movimiento.',
  },
  navbar: {
    index:               'Inicio',
    'quienes-somos':     'Quiénes Somos',
    servicios:           'Servicios',
    montajes:            'Montajes',
    galeria:              'Galería',
    clientes:            'Clientes',
    contacto:            'Contacto',
  },
  footer_extra: {
    nav_heading:        'Navegación',
    contact_heading:    'Atención Comercial',
    copyright_name:     'Grúas InGlobal S.R.L.',
    aviso_legal:        'Aviso Legal',
    politica_privacidad: 'Política de Privacidad',
  },
  home_gallery: {
    label:      'Nuestro Trabajo',
    heading:    'Proyectos que nos definen',
    subheading: 'Visualizá la magnitud de nuestras operaciones en sectores industrial, energético e infraestructura.',
    link_text:  'Ver galería completa',
    item1_src: '/images/igb-1.webp', item1_alt: 'Grúa telescópica en operación', item1_label: 'Izaje Industrial',
    item2_src: '/images/igb-5.webp', item2_alt: 'Grúas en planta industrial', item2_label: 'Planta Industrial',
    item3_src: '/images/igb-7.webp', item3_alt: 'Montaje industrial con plataforma', item3_label: 'Montaje Especial',
    item4_src: '/images/igb-9.webp', item4_alt: 'Izaje de tanque industrial al atardecer', item4_label: 'Petroquímica',
    item5_src: '/images/igb-10.webp', item5_alt: 'Operaciones logísticas de maquinaria pesada', item5_label: 'Logística Pesada',
  },
}

// ─────────────────────────────────────────────────────────────
// montajes fallbacks
// ─────────────────────────────────────────────────────────────
export const FALLBACK_MONTAJES: Montaje[] = [
  {
    id:            'fallback-montaje-0',
    slug:          'traslado-vagon-historico',
    title:         'Traslado de Vagón Histórico',
    excerpt:       'Operación logística integral utilizando grúas telescópicas de alta capacidad para el posicionamiento de patrimonio ferroviario.',
    content:       null,
    cover_image:   'igb-3',
    tags:          ['Córdoba', 'Telescópicas', 'Patrimonio'],
    display_order: 0,
    published:     true,
    created_at:    '',
    updated_at:    '',
  },
  {
    id:            'fallback-montaje-1',
    slug:          'estructura-navidena-gigante',
    title:         'Estructura Navideña Gigante',
    excerpt:       'Montaje de precisión en zona urbana. Trabajo nocturno coordinado con múltiples equipos de izaje y seguridad.',
    content:       null,
    cover_image:   'igb-4',
    tags:          ['Eventos', 'Estructura', 'Izaje'],
    display_order: 1,
    published:     true,
    created_at:    '',
    updated_at:    '',
  },
  {
    id:            'fallback-montaje-2',
    slug:          'instalacion-planta-industrial',
    title:         'Instalación en Planta Industrial',
    excerpt:       'Posicionamiento de equipos de producción mediante maniobras coordinadas en espacios reducidos.',
    content:       null,
    cover_image:   'igb-5',
    tags:          ['Industrial', 'Planta', 'Precisión'],
    display_order: 2,
    published:     true,
    created_at:    '',
    updated_at:    '',
  },
  {
    id:            'fallback-montaje-3',
    slug:          'silos-planta-petroquimica',
    title:         'Silos en Planta Petroquímica',
    excerpt:       'Izaje y montaje de estructuras verticales de gran envergadura con personal especializado en altura.',
    content:       null,
    cover_image:   'igb-10',
    tags:          ['Petroquímica', 'Silos', 'Montaje'],
    display_order: 3,
    published:     true,
    created_at:    '',
    updated_at:    '',
  },
  {
    id:            'fallback-montaje-4',
    slug:          'tanque-industrial-gran-porte',
    title:         'Tanque Industrial de Gran Porte',
    excerpt:       'Planificación técnica para el izaje de tanques en condiciones de espacio críticas. Ejecución impecable.',
    content:       null,
    cover_image:   'igb-9',
    tags:          ['Industrial', 'Tanque', 'Izaje'],
    display_order: 4,
    published:     true,
    created_at:    '',
    updated_at:    '',
  },
  {
    id:            'fallback-montaje-5',
    slug:          'estructura-metalica-altura',
    title:         'Estructura Metálica de Altura',
    excerpt:       'Montaje simultáneo de pórticos metálicos para naves industriales de logística avanzada.',
    content:       null,
    cover_image:   'igb-8',
    tags:          ['Logística', 'Altura', 'Estructuras'],
    display_order: 5,
    published:     true,
    created_at:    '',
    updated_at:    '',
  },
]

// ─────────────────────────────────────────────────────────────
// clientes fallbacks (25 clientes — work_rank como en la migración)
// ─────────────────────────────────────────────────────────────
export const FALLBACK_CLIENTES: Cliente[] = [
  { id: 'fb-cl-0',  slug: 'aguas-cordobesas',  name: 'Aguas Cordobesas', logo: '/images/logos/AGUASCORDOBESAS-logo.png', bio: null, content: null, featured: true, work_rank: 100, published: true, created_at: '', updated_at: '' },
  { id: 'fb-cl-1',  slug: 'bunge',             name: 'Bunge',            logo: '/images/logos/BUNGE-logo.png',           bio: null, content: null, featured: true, work_rank: 90,  published: true, created_at: '', updated_at: '' },
  { id: 'fb-cl-2',  slug: 'coca-cola',         name: 'Coca-Cola',        logo: '/images/logos/COCACOLA-logo.png',        bio: null, content: null, featured: true, work_rank: 80,  published: true, created_at: '', updated_at: '' },
  { id: 'fb-cl-3',  slug: 'electro-ingenieria',name: 'Electro Ingeniería',logo: '/images/logos/ELECTROINGENIERIA-logo.png', bio: null, content: null, featured: true, work_rank: 70, published: true, created_at: '', updated_at: '' },
  { id: 'fb-cl-4',  slug: 'epec',              name: 'EPEC',             logo: '/images/logos/EPEC-logo.png',            bio: null, content: null, featured: true, work_rank: 60,  published: true, created_at: '', updated_at: '' },
  { id: 'fb-cl-5',  slug: 'holcim',            name: 'Holcim',           logo: '/images/logos/HOLCIM-logo.png',          bio: null, content: null, featured: true, work_rank: 50,  published: true, created_at: '', updated_at: '' },
  { id: 'fb-cl-6',  slug: 'roggio',            name: 'Roggio',           logo: '/images/logos/ROGGIO-logo.png',          bio: null, content: null, featured: true, work_rank: 40,  published: true, created_at: '', updated_at: '' },
  { id: 'fb-cl-7',  slug: 'grupo-edisur',      name: 'Grupo Edisur',     logo: '/images/logos/GRUPOEDISUR-logo.png',     bio: null, content: null, featured: true, work_rank: 30,  published: true, created_at: '', updated_at: '' },
  { id: 'fb-cl-8',  slug: 'grupo-proaco',      name: 'Grupo Proaco',     logo: '/images/logos/GRUPOPROACO-logo.png',     bio: null, content: null, featured: true, work_rank: 20,  published: true, created_at: '', updated_at: '' },
  { id: 'fb-cl-9',  slug: 'porta',             name: 'Porta',            logo: '/images/logos/PORTA-logo.png',           bio: null, content: null, featured: true, work_rank: 10,  published: true, created_at: '', updated_at: '' },
  { id: 'fb-cl-10', slug: 'armoy',             name: 'Armoy',            logo: '/images/logos/ARMOY-logo.png',           bio: null, content: null, featured: true, work_rank: 10,  published: true, created_at: '', updated_at: '' },
  { id: 'fb-cl-11', slug: 'bbc',               name: 'BBC',              logo: '/images/logos/BBC-logo.png',             bio: null, content: null, featured: true, work_rank: 10,  published: true, created_at: '', updated_at: '' },
  { id: 'fb-cl-12', slug: 'enco',              name: 'ENCO',             logo: '/images/logos/ENCO-logo.png',            bio: null, content: null, featured: true, work_rank: 10,  published: true, created_at: '', updated_at: '' },
  { id: 'fb-cl-13', slug: 'gama',              name: 'GAMA',             logo: '/images/logos/GAMA-logo.png',            bio: null, content: null, featured: true, work_rank: 10,  published: true, created_at: '', updated_at: '' },
  { id: 'fb-cl-14', slug: 'habika',            name: 'Habika',           logo: '/images/logos/HABIKA-logo.png',          bio: null, content: null, featured: true, work_rank: 10,  published: true, created_at: '', updated_at: '' },
  { id: 'fb-cl-15', slug: 'hasa',              name: 'HASA',             logo: '/images/logos/HASA-logo.png',            bio: null, content: null, featured: true, work_rank: 10,  published: true, created_at: '', updated_at: '' },
  { id: 'fb-cl-16', slug: 'horpas',            name: 'Horpas',           logo: '/images/logos/HORPAS-logo.png',          bio: null, content: null, featured: true, work_rank: 10,  published: true, created_at: '', updated_at: '' },
  { id: 'fb-cl-17', slug: 'infinito-open',     name: 'Infinito Open',    logo: '/images/logos/INFINITO-logo.png',        bio: null, content: null, featured: true, work_rank: 10,  published: true, created_at: '', updated_at: '' },
  { id: 'fb-cl-18', slug: 'ingenia',           name: 'Ingenia',          logo: '/images/logos/INGENIA-logo.png',         bio: null, content: null, featured: true, work_rank: 10,  published: true, created_at: '', updated_at: '' },
  { id: 'fb-cl-19', slug: 'ivecor',            name: 'Ivecor',           logo: '/images/logos/IVECOR-logo.png',          bio: null, content: null, featured: true, work_rank: 10,  published: true, created_at: '', updated_at: '' },
  { id: 'fb-cl-20', slug: 'lucy',              name: 'Lucy',             logo: '/images/logos/LUCY-logo.png',            bio: null, content: null, featured: true, work_rank: 10,  published: true, created_at: '', updated_at: '' },
  { id: 'fb-cl-21', slug: 'quimex',            name: 'Quimex',           logo: '/images/logos/QUIMEX-logo.png',          bio: null, content: null, featured: true, work_rank: 10,  published: true, created_at: '', updated_at: '' },
  { id: 'fb-cl-22', slug: 'siglo-21',          name: 'Siglo 21',         logo: '/images/logos/SIGLO21-logo.png',         bio: null, content: null, featured: true, work_rank: 10,  published: true, created_at: '', updated_at: '' },
  { id: 'fb-cl-23', slug: 'sullair',           name: 'Sullair',          logo: '/images/logos/SULLAIR-logo.png',         bio: null, content: null, featured: true, work_rank: 10,  published: true, created_at: '', updated_at: '' },
  { id: 'fb-cl-24', slug: 'tecsma',            name: 'Tecsma',           logo: '/images/logos/TECSMA-logo.png',          bio: null, content: null, featured: true, work_rank: 10,  published: true, created_at: '', updated_at: '' },
]

// ─────────────────────────────────────────────────────────────
// servicios fallbacks
// ─────────────────────────────────────────────────────────────
export const FALLBACK_SERVICIOS: Servicio[] = [
  {
    id:            'fallback-srv-0',
    slug:          'gruas-telescopicas',
    title:         'Grúas Telescópicas',
    desc:          'Equipos de alta performance para elevación y movimiento de cargas pesadas en obras industriales y de construcción. Contamos con grúas de 3 a 200 toneladas de capacidad y hasta 100 metros de altura.',
    excerpt:       'Grúas de 3 a 200 toneladas y hasta 100m de altura para obras industriales.',
    specs:         ['3 a 200 Tn de capacidad', 'Hasta 100m de altura', 'Certificación vigente', 'Operadores capacitados'],
    img:           'igb-1',
    icon:          'ArrowUpToLine',
    display_order: 0,
    published:     true,
    created_at:    '',
    updated_at:    '',
  },
  {
    id:            'fallback-srv-1',
    slug:          'hidrogruas',
    title:         'Hidrogrúas',
    desc:          'Hidrogrúas montadas con barquilla para trabajos en altura, mantenimiento industrial y montajes especiales. Ideales para acceder a zonas de difícil alcance con total seguridad.',
    excerpt:       'Barquilla para trabajos en altura y acceso a zonas de difícil alcance.',
    specs:         ['Barquilla incluida', 'Acceso a zonas complejas', 'Mantenimiento industrial', 'Montajes especiales'],
    img:           'igb-2',
    icon:          'HardHat',
    display_order: 1,
    published:     true,
    created_at:    '',
    updated_at:    '',
  },
  {
    id:            'fallback-srv-2',
    slug:          'movimientos-pesados',
    title:         'Movimientos Pesados',
    desc:          'Trabajos especiales de movimiento y posicionamiento de estructuras de gran envergadura y peso considerable. Cada proyecto es planificado a medida según las necesidades del cliente.',
    excerpt:       'Movimiento y posicionamiento de estructuras de gran envergadura.',
    specs:         ['Planificación personalizada', 'Estructuras de gran envergadura', 'Personal especializado', 'Seguridad certificada'],
    img:           'igb-7',
    icon:          'Move',
    display_order: 2,
    published:     true,
    created_at:    '',
    updated_at:    '',
  },
  {
    id:            'fallback-srv-3',
    slug:          'traslados',
    title:         'Traslados con Carretones',
    desc:          'Servicio de transporte de maquinarias y estructuras pesadas con carretones especializados a todo el país. Logística integral para garantizar que tu carga llegue en tiempo y forma.',
    excerpt:       'Transporte de maquinaria pesada con carretones a todo el país.',
    specs:         ['Cobertura nacional', 'Maquinaria pesada', 'Carretones especializados', 'Logística integral'],
    img:           'igb-3',
    icon:          'Truck',
    display_order: 3,
    published:     true,
    created_at:    '',
    updated_at:    '',
  },
]

export const FALLBACK_GALERIA: Galeria[] = [
  { id: 'fallback-gal-1',  imagen: 'igb-1',  alt: 'Grúa telescópica principal en operación',      col_span_mobile: 1, row_span_mobile: 1, col_span_desktop: 2, row_span_desktop: 2, display_order: 0, published: true, created_at: '', updated_at: '' },
  { id: 'fallback-gal-2',  imagen: 'igb-2',  alt: 'Hidrogrúa con barquilla en planta industrial', col_span_mobile: 1, row_span_mobile: 1, col_span_desktop: 1, row_span_desktop: 1, display_order: 1, published: true, created_at: '', updated_at: '' },
  { id: 'fallback-gal-3',  imagen: 'igb-3',  alt: 'Traslado de maquinaria con carretón pesado',   col_span_mobile: 1, row_span_mobile: 1, col_span_desktop: 1, row_span_desktop: 1, display_order: 2, published: true, created_at: '', updated_at: '' },
  { id: 'fallback-gal-4',  imagen: 'igb-4',  alt: 'Montaje de silos en petroquímica',              col_span_mobile: 1, row_span_mobile: 1, col_span_desktop: 1, row_span_desktop: 1, display_order: 3, published: true, created_at: '', updated_at: '' },
  { id: 'fallback-gal-5',  imagen: 'igb-5',  alt: 'Par de grúas operando en tándem',                col_span_mobile: 1, row_span_mobile: 1, col_span_desktop: 1, row_span_desktop: 1, display_order: 4, published: true, created_at: '', updated_at: '' },
  { id: 'fallback-gal-6',  imagen: 'igb-6',  alt: 'Izaje de estructura metálica en altura',         col_span_mobile: 1, row_span_mobile: 1, col_span_desktop: 1, row_span_desktop: 1, display_order: 5, published: true, created_at: '', updated_at: '' },
  { id: 'fallback-gal-7',  imagen: 'igb-7',  alt: 'Grúa en muelle industrial',                      col_span_mobile: 1, row_span_mobile: 1, col_span_desktop: 2, row_span_desktop: 1, display_order: 6, published: true, created_at: '', updated_at: '' },
  { id: 'fallback-gal-8',  imagen: 'igb-8',  alt: 'Mantenimiento preventivo en obra',                col_span_mobile: 1, row_span_mobile: 1, col_span_desktop: 1, row_span_desktop: 1, display_order: 7, published: true, created_at: '', updated_at: '' },
  { id: 'fallback-gal-9',  imagen: 'igb-9',  alt: 'Izaje nocturno en planta',                        col_span_mobile: 1, row_span_mobile: 1, col_span_desktop: 1, row_span_desktop: 1, display_order: 8, published: true, created_at: '', updated_at: '' },
  { id: 'fallback-gal-10', imagen: 'igb-10', alt: 'Grúa telescópica en parque eólico',               col_span_mobile: 1, row_span_mobile: 1, col_span_desktop: 1, row_span_desktop: 1, display_order: 9, published: true, created_at: '', updated_at: '' },
]

// ─────────────────────────────────────────────────────────────
// Accesos rápidos del home del panel — candidatos predefinidos
// ─────────────────────────────────────────────────────────────
// El cliente elige de esta lista fija (no tipea rutas a mano, ver LinkList
// vs QuickLinksPicker en Field.tsx) — mantenerla al día con las rutas de
// alta reales del dashboard.
export const QUICKLINK_CANDIDATES: { href: string; label: string }[] = [
  { href: '/dashboard/montajes/nuevo', label: 'Nuevo Montaje' },
  { href: '/dashboard/clientes/nuevo', label: 'Nuevo Cliente' },
  { href: '/dashboard/galeria/nuevo', label: 'Nueva Foto de Galería' },
  { href: '/dashboard/agenda/nuevo', label: 'Nuevo Evento de Agenda' },
  { href: '/dashboard/agenda', label: 'Ver Agenda' },
  { href: '/dashboard/agenda/calendario', label: 'Calendario' },
  { href: '/dashboard/agenda/catalogos', label: 'Catálogos de Agenda' },
  { href: '/dashboard/usuarios', label: 'Usuarios' },
  { href: '/dashboard/contenido/hero', label: 'Editar Hero' },
  { href: '/dashboard/contenido/footer', label: 'Editar Footer' },
  { href: '/dashboard/contenido/stats', label: 'Editar Stats' },
]
