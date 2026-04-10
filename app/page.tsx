import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle,
  Zap,
  Users,
  Shield,
  Truck,
  ArrowUpRight,
} from 'lucide-react'

// ─── DATA ────────────────────────────────────────────────────────────────────

const stats = [
  { number: '40+', label: 'Años de experiencia' },
  { number: '200', label: 'Toneladas de capacidad' },
  { number: '100m', label: 'Altura máxima' },
]

const services = [
  {
    id: 'gruas-telescopicas',
    icon: ArrowUpRight,
    title: 'Grúas Telescópicas',
    desc: 'Equipos de alta performance para elevación y movimiento de cargas pesadas en obras industriales.',
    specs: '3 a 200 Tn · Hasta 100m',
  },
  {
    id: 'hidrogruas',
    icon: Truck,
    title: 'Hidrogrúas',
    desc: 'Hidrogrúas montadas con barquilla para trabajos en altura y montajes especiales.',
    specs: 'Con barquilla incluida',
  },
  {
    id: 'movimientos-pesados',
    icon: Zap,
    title: 'Movimientos Pesados',
    desc: 'Trabajos especiales de movimiento y posicionamiento de estructuras de gran envergadura.',
    specs: 'Trabajos a medida',
  },
  {
    id: 'traslados',
    icon: Shield,
    title: 'Traslados con Carretones',
    desc: 'Transporte de maquinarias y estructuras pesadas con carretones especializados a todo el país.',
    specs: 'Cobertura nacional',
  },
]

const galleryItems = [
  { src: '/images/igb-1.webp', alt: 'Grúa telescópica en operación', span: 'lg:col-span-2 lg:row-span-2', label: 'Izaje Industrial' },
  { src: '/images/igb-5.webp', alt: 'Grúas en planta industrial', label: 'Planta Industrial' },
  { src: '/images/igb-7.webp', alt: 'Montaje industrial con plataforma', label: 'Montaje Especial' },
  { src: '/images/igb-9.webp', alt: 'Izaje de tanque industrial al atardecer', label: 'Petroquímica' },
]

const clients = [
  { name: 'Aguas Cordobesas', logo: '/images/logos/AGUASCORDOBESAS-logo.png' },
  { name: 'Bunge', logo: '/images/logos/BUNGE-logo.png' },
  { name: 'Coca-Cola', logo: '/images/logos/COCACOLA-logo.png' },
  { name: 'Electro Ingeniería', logo: '/images/logos/ELECTROINGENIERIA-logo.png' },
  { name: 'EPEC', logo: '/images/logos/EPEC-logo.png' },
  { name: 'Holcim', logo: '/images/logos/HOLCIM-logo.png' },
  { name: 'Roggio', logo: '/images/logos/ROGGIO-logo.png' },
  { name: 'Grupo Edisur', logo: '/images/logos/GRUPOEDISUR-logo.png' },
  { name: 'Grupo Proaco', logo: '/images/logos/GRUPOPROACO-logo.png' },
  { name: 'Porta', logo: '/images/logos/PORTA-logo.png' },
]

const features = [
  { icon: CheckCircle, text: 'Operadores y equipos certificados en todo el país' },
  { icon: Zap, text: 'Rapidez, seguridad, costo y calidad como diferencial' },
  { icon: Users, text: 'Nuestros clientes nos eligen una y otra vez' },
]

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center overflow-hidden" id="inicio">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/igb-3.webp"
            alt="Grúas InGlobal — Traslado de maquinaria pesada en Córdoba"
            fill
            priority
            sizes="100vw"
            quality={85}
            className="object-cover object-center"
          />
          {/* Gradient overlay: left-heavy per Figma design */}
          <div className="absolute inset-0 bg-gradient-to-r from-igb-surface via-igb-surface/80 to-igb-surface/20" />
        </div>

        <div className="relative z-10 container-igb w-full pt-24 pb-16">
          <div className="max-w-2xl">
            <span className="label-tag">Córdoba · Argentina</span>
            <h1 className="heading-hero mb-6">
              Elevando tus proyectos con{' '}
              <span className="text-igb-yellow-dark">seguridad</span>{' '}
              y precisión.
            </h1>
            <p className="text-body-lg mb-10 max-w-lg">
              Líderes en alquiler de grúas y montajes industriales de alta complejidad. Operadores y equipos certificados en toda Argentina.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contacto" className="btn-primary">
                Solicitar Presupuesto
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/servicios" className="btn-outline">
                Ver Servicios
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-14 pt-10 border-t border-igb-outline/30">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-3xl font-headline font-extrabold text-igb-on-surface tracking-tight">
                    {s.number}
                  </p>
                  <p className="text-sm text-igb-secondary mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section className="section-pad bg-igb-surface" id="about">
        <div className="container-igb">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <Image
                src="/images/igb-2.webp"
                alt="Equipo de Grúas InGlobal trabajando en altura"
                width={620}
                height={480}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="rounded-xl object-cover w-full aspect-[4/3]"
                quality={85}
              />
              {/* Floating badge */}
              <div className="absolute -bottom-6 -right-6 bg-igb-yellow text-igb-on-yellow rounded-xl p-5 shadow-igb-lg hidden md:block">
                <p className="text-3xl font-headline font-extrabold leading-none">40+</p>
                <p className="text-xs font-bold mt-1 uppercase tracking-wide">Años de trayectoria</p>
              </div>
            </div>

            <div>
              <span className="label-tag">Quiénes Somos</span>
              <h2 className="heading-display mb-6">
                Grúas InGlobal <span className="text-igb-yellow-dark">S.R.L.</span>
              </h2>
              <div className="space-y-4 text-igb-secondary leading-relaxed">
                <p>
                  Somos <strong className="text-igb-on-surface">Inglobal</strong>, una empresa líder en movimientos especiales pesados y montajes industriales. Como continuadores de una empresa familiar con más de <strong className="text-igb-on-surface">40 años de trayectoria</strong>, combinamos experiencia técnica con un compromiso inquebrantable hacia nuestros clientes.
                </p>
                <p>
                  Ofrecemos el alquiler de grúas, hidrogrúas, transporte y maquinaria pesada en todo el país. Nos respaldan <strong className="text-igb-on-surface">operadores y equipos certificados</strong>, garantizando que cada operación cumpla con los más altos estándares de seguridad y eficiencia.
                </p>
              </div>

              <ul className="mt-8 space-y-4">
                {features.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-igb-yellow-dark flex-shrink-0" />
                    <span className="text-igb-on-surface/80 text-sm">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SERVICES PREVIEW ===== */}
      <section className="section-pad bg-igb-surface-low" id="servicios-preview">
        <div className="container-igb">
          <div className="mb-16">
            <span className="label-tag">Excelencia Operativa</span>
            <h2 className="heading-display">Ingeniería en Movimiento</h2>
            <p className="text-body-lg mt-4 max-w-xl">
              Ofrecemos el alquiler de diferentes equipos para dar solución a las necesidades de nuestros clientes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map(({ id, icon: Icon, title, desc, specs }) => (
              <div key={id} className="card-igb group">
                <div className="w-12 h-12 bg-igb-yellow/20 rounded-lg flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-igb-yellow-dark" />
                </div>
                <h3 className="text-lg font-headline font-bold mb-3 text-igb-on-surface">
                  {title}
                </h3>
                <p className="text-igb-secondary text-sm leading-relaxed mb-4">{desc}</p>
                <span className="text-xs font-bold text-igb-yellow-dark tracking-wide uppercase">
                  {specs}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/servicios" className="btn-outline">
              Ver todos los servicios
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="relative py-24 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/igb-10.webp"
            alt="Montaje de silos en planta petroquímica"
            fill
            sizes="100vw"
            quality={75}
            className="object-cover object-center opacity-20"
          />
        </div>
        <div className="relative z-10 container-igb">
          <div className="max-w-2xl">
            <span className="text-igb-yellow text-xs font-bold tracking-widest uppercase mb-4 block">
              Más de 40 años de experiencia
            </span>
            <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-white tracking-tight leading-tight mb-6">
              Montajes Industriales<br />a Medida
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-10">
              Nos gusta lo difícil, nos atrae lo complicado y logramos lo imposible.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contacto" className="btn-primary">
                Contactanos
              </Link>
              <Link href="/montajes" className="btn-outline-white">
                Ver Montajes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== GALLERY BENTO ===== */}
      <section className="section-pad bg-igb-surface" id="galeria-preview">
        <div className="container-igb">
          <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-6">
            <div>
              <span className="label-tag">Nuestro Trabajo</span>
              <h2 className="heading-display">Proyectos que nos definen</h2>
              <p className="text-body-lg mt-3 max-w-md">
                Visualizá la magnitud de nuestras operaciones en sectores industrial, energético e infraestructura.
              </p>
            </div>
            <Link
              href="/galeria"
              className="flex items-center gap-2 text-igb-yellow-dark font-bold font-headline text-sm hover:gap-3 transition-all flex-shrink-0"
            >
              Ver galería completa
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 md:h-[600px]">
            {galleryItems.map((item, i) => (
              <div
                key={item.src}
                className={`relative overflow-hidden rounded-xl ${item.span || ''}`}
                style={{ minHeight: i === 0 ? undefined : '200px' }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes={
                    i === 0
                      ? '(max-width: 768px) 100vw, 50vw'
                      : '(max-width: 768px) 100vw, 25vw'
                  }
                  quality={80}
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute bottom-0 left-0 p-5 bg-gradient-to-t from-black/70 to-transparent w-full text-white">
                  <p className="text-xs uppercase tracking-widest font-bold opacity-70 mb-1">
                    {item.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CLIENTS ===== */}
      <section className="section-pad bg-igb-surface-low" id="clientes-preview">
        <div className="container-igb">
          <div className="text-center mb-14">
            <span className="label-tag text-center flex justify-center">Confían en nosotros</span>
            <h2 className="heading-display">Nuestros Clientes</h2>
            <p className="text-body-lg mt-3 max-w-xl mx-auto">
              Empresas líderes que avalan nuestro compromiso y responsabilidad.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 items-center">
            {clients.map((client) => (
              <div
                key={client.name}
                className="flex items-center justify-center p-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              >
                <Image
                  src={client.logo}
                  alt={`Logo ${client.name}`}
                  width={140}
                  height={60}
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 15vw"
                  className="object-contain h-12 w-auto"
                />
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/clientes" className="btn-outline">
              Ver todos los clientes
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== LOCATION ===== */}
      <section className="section-pad bg-igb-surface" id="ubicacion">
        <div className="container-igb">
          <div className="text-center mb-12">
            <span className="label-tag flex justify-center">Dónde Encontrarnos</span>
            <h2 className="heading-display">Nuestra Ubicación</h2>
            <p className="text-body-lg mt-3 max-w-xl mx-auto">
              Acercate a nuestras oficinas o contactanos para planificar tu próximo movimiento.
            </p>
          </div>

          <div className="rounded-xl overflow-hidden shadow-igb">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5120.735420778664!2d-64.1812979!3d-31.3339384!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9432997e4baee84d%3A0xd4a924978118ee6f!2sGr%C3%BAas%20Inglobal%20SRL!5e1!3m2!1ses!2sar!4v1773003277957!5m2!1ses!2sar"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Grúas InGlobal S.R.L."
            />
          </div>
        </div>
      </section>

      {/* ===== CONTACT CTA ===== */}
      <section className="section-pad bg-igb-surface-low">
        <div className="container-igb text-center">
          <span className="label-tag flex justify-center">¿Tenés un proyecto?</span>
          <h2 className="heading-display mb-4">Consultanos sin compromiso</h2>
          <p className="text-body-lg max-w-lg mx-auto mb-8">
            Estamos para resolver tu necesidad de movimiento y elevación. Respondemos rápido.
          </p>
          <Link href="/contacto" className="btn-primary mx-auto">
            Enviar consulta
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
