import Image from 'next/image'
import Link from 'next/link'
import Picture from '@/components/Picture'
import HeroVideo from '@/components/HeroVideo'
import LazyGoogleMap from '@/components/LazyGoogleMap'
import { getSiteSettings, getServicios, getClientes } from '@/lib/content'

// ─── Static gallery (not in CMS scope) ───────────────────────────────────────
const galleryItems = [
  {
    src: '/images/igb-1.webp',
    alt: 'Grúa telescópica en operación',
    span: 'md:col-span-2 md:row-span-2',
    label: 'Izaje Industrial',
  },
  {
    src: '/images/igb-5.webp',
    alt: 'Grúas en planta industrial',
    span: 'md:col-span-1 md:row-span-1',
    label: 'Planta Industrial',
  },
  {
    src: '/images/igb-7.webp',
    alt: 'Montaje industrial con plataforma',
    span: 'md:col-span-1 md:row-span-1',
    label: 'Montaje Especial',
  },
  {
    src: '/images/igb-9.webp',
    alt: 'Izaje de tanque industrial al atardecer',
    span: 'md:col-span-1 md:row-span-1',
    label: 'Petroquímica',
  },
  {
    src: '/images/igb-10.webp',
    alt: 'Operaciones logísticas de maquinaria pesada',
    span: 'md:col-span-1 md:row-span-1',
    label: 'Logística Pesada',
  },
]

// ─── Default stats (fallback before DB is populated) ─────────────────────────
const defaultStats = [
  { number: '40+', label: 'Años de experiencia' },
  { number: '200t', label: 'Toneladas de capacidad' },
  { number: '100m', label: 'Altura máxima' },
]

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [heroSettings, statsSettings, queHacemosSettings, ctaBannerSettings, clientesDestSettings, ubicacionSettings, servicios, clientes] =
    await Promise.all([
      getSiteSettings('hero'),
      getSiteSettings('stats'),
      getSiteSettings('que_hacemos'),
      getSiteSettings('cta_banner'),
      getSiteSettings('clientes_destacados'),
      getSiteSettings('ubicacion'),
      getServicios(),
      getClientes(),
    ])

  // Hero
  const heroHeadline =
    (heroSettings.headline as string) ||
    'Elevando tus proyectos con seguridad y precisión.'
  const heroSubheadline =
    (heroSettings.subheadline as string) ||
    'Líderes en alquiler de grúas y montajes industriales de alta complejidad. Operadores y equipos certificados en toda Argentina.'
  const heroCtaPrimary = (heroSettings.cta_primary as string) || 'Solicitar Presupuesto'
  const heroCtaSecondary = (heroSettings.cta_secondary as string) || 'Ver Servicios'
  const heroVideoUrl = (heroSettings.video_url as string | null | undefined) || null
  const heroVideoUrlMobile = (heroSettings.video_url_mobile as string | null | undefined) || null
  const heroVideoFocal = (heroSettings.video_focal as string | null | undefined) || null
  const heroFallbackImage = (heroSettings.fallback_image as string) || 'igb-3'
  // default 100 = comportamiento idéntico al fijo de antes (los alphas ya están en las clases bg-igb-surface/90 etc.)
  const heroOverlayOpacity = Number(heroSettings.overlay_opacity ?? 100) / 100

  // Stats
  const statsItems: { number: string; label: string }[] = Array.isArray(statsSettings.items)
    ? (statsSettings.items as { number: string; label: string }[])
    : defaultStats

  // Qué Hacemos
  const qhLabel = (queHacemosSettings.label as string) || 'Excelencia Operativa'
  const qhHeading = (queHacemosSettings.heading as string) || 'Ingeniería en Movimiento'
  const qhSubheading =
    (queHacemosSettings.subheading as string) ||
    'Ofrecemos el alquiler de diferentes equipos para dar solución a las necesidades de nuestros clientes.'

  // CTA banner
  const ctaHeading =
    (ctaBannerSettings.heading as string) ||
    'Ingeniería aplicada a montajes complejos'
  const ctaSubheading =
    (ctaBannerSettings.subheading as string) ||
    'Soluciones logísticas y de izaje para los desafíos más exigentes de la industria.'
  const ctaPrimary = (ctaBannerSettings.cta_primary as string) || 'Solicitar Cotización'
  const ctaSecondary = (ctaBannerSettings.cta_secondary as string) || 'Ver Montajes'
  const ctaBgImage = (ctaBannerSettings.background_image as string) || 'igb-10'

  // Clientes destacados
  const cdLabel = (clientesDestSettings.label as string) || 'Confían en nosotros'
  const cdHeading = (clientesDestSettings.heading as string) || 'Nuestros Clientes'
  const cdSubheading =
    (clientesDestSettings.subheading as string) ||
    'Empresas líderes que avalan nuestro compromiso y responsabilidad.'

  // Ubicación
  const ubicLabel = (ubicacionSettings.label as string) || 'Dónde Encontrarnos'
  const ubicHeading = (ubicacionSettings.heading as string) || 'Nuestra Ubicación'
  const ubicSubheading =
    (ubicacionSettings.subheading as string) ||
    'Acercate a nuestras oficinas o contactanos para planificar tu próximo movimiento.'

  return (
    <>
      {/* ===== HERO ===== */}
      <section
        className="relative min-h-screen flex items-center bg-igb-surface"
        id="inicio"
      >
        <div className="absolute inset-0 z-0 overflow-hidden">
          <HeroVideo
            videoUrl={heroVideoUrl}
            mobileVideoUrl={heroVideoUrlMobile}
            videoFocal={heroVideoFocal}
            fallbackImageSrc={heroFallbackImage}
            fallbackImageAlt="Grúas InGlobal — Traslado de maquinaria pesada en Córdoba"
            className="object-cover object-[70%_center] md:object-center"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-igb-surface via-igb-surface/85 to-igb-surface/30 md:bg-transparent md:bg-gradient-to-r md:from-igb-surface md:via-igb-surface/95 md:via-igb-surface/80 md:to-transparent"
            style={{ opacity: heroOverlayOpacity }}
          />
        </div>

        <div className="relative z-10 container-igb w-full pt-32 pb-16 md:pt-24">
          <div className="max-w-2xl">
            <h1 className="heading-hero mb-6 text-zinc-900 hero-anim hero-anim-d1">
              {heroHeadline.split('seguridad').length > 1 ? (
                <>
                  {heroHeadline.split('seguridad')[0]}
                  <span className="text-igb-yellow-dark">seguridad</span>
                  {heroHeadline.split('seguridad')[1]}
                </>
              ) : (
                heroHeadline
              )}
            </h1>

            <p className="hidden md:block text-igb-secondary text-lg md:text-xl mb-10 max-w-lg leading-relaxed font-medium hero-anim hero-anim-d2">
              {heroSubheadline}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 hero-anim hero-anim-d3">
              <Link href="/contacto" className="btn-primary text-center">
                {heroCtaPrimary}
              </Link>
              <Link
                href="/servicios"
                className="btn-outline text-center bg-white/50 backdrop-blur-sm sm:bg-transparent hidden md:inline-flex md:items-center md:justify-center"
              >
                {heroCtaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS (banner debajo del hero — separado para que el video se vea limpio) ===== */}
      {statsItems.length > 0 && (
        <section className="bg-igb-surface border-y border-igb-outline/50 py-10">
          <div className="container-igb" data-animate="fade-up">
            <div className="grid grid-cols-3 gap-x-3 sm:gap-x-6 md:flex md:flex-wrap md:justify-center md:gap-16">
              {statsItems.map((s, i) => {
                const accent = ['text-igb-yellow-dark', 'text-igb-navy', 'text-igb-on-surface'][i % 3]
                return (
                  <div key={s.label} className="group text-center md:text-left">
                    <p
                      className={`text-2xl sm:text-3xl md:text-4xl font-headline font-extrabold ${accent} tracking-tight group-hover:text-igb-yellow-dark transition-colors leading-none`}
                    >
                      {s.number}
                    </p>
                    <p className="text-[10px] sm:text-[11px] md:text-sm text-igb-secondary mt-2 font-bold uppercase tracking-wider leading-snug">
                      {s.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== QUÉ HACEMOS (Servicios preview) ===== */}
      <section className="section-pad bg-igb-surface-low" id="servicios-preview">
        <div className="container-igb">
          <div className="mb-16" data-animate="fade-up">
            <span className="label-tag">{qhLabel}</span>
            <h2 className="heading-display">{qhHeading}</h2>
            <p className="text-body-lg mt-4 max-w-xl">
              {qhSubheading}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {servicios.map((servicio) => {
              const isRemoteImg = servicio.img?.startsWith('http')
              return (
                <Link
                  key={servicio.slug}
                  href={`/servicios?servicio=${servicio.slug}`}
                  className="card-igb group flex flex-col h-full cursor-pointer"
                  data-animate="fade-up"
                >
                  {/* Service image */}
                  {servicio.img && (
                    <div className="relative overflow-hidden rounded-lg mb-5 aspect-[4/3]">
                      {isRemoteImg ? (
                        <Image
                          src={servicio.img}
                          alt={servicio.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <Picture
                          src={servicio.img}
                          alt={servicio.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                  )}

                  <h3 className="text-2xl font-headline font-bold text-igb-on-surface leading-tight line-clamp-2 min-h-[3.75rem]">
                    {servicio.title}
                  </h3>
                  {servicio.excerpt && (
                    <p className="text-sm text-igb-secondary mt-2 leading-relaxed">
                      {servicio.excerpt}
                    </p>
                  )}
                </Link>
              )
            })}
          </div>

          <div className="mt-12 text-center" data-animate="fade-up" data-delay="150">
            <Link href="/servicios" className="btn-outline">
              Ver todos los servicios
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          {ctaBgImage.startsWith('http') ? (
            <Image
              src={ctaBgImage}
              alt="Montaje de maquinaria pesada en industria"
              fill
              sizes="100vw"
              className="object-cover object-center opacity-30"
            />
          ) : (
            <Picture
              src={ctaBgImage}
              alt="Montaje de maquinaria pesada en industria"
              fill
              sizes="100vw"
              className="object-cover object-center opacity-30"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
        </div>

        <div className="relative z-10 container-igb">
          <div className="max-w-2xl">
            <h2
              className="text-4xl md:text-5xl font-headline font-extrabold text-white tracking-tight leading-tight mb-6"
              data-animate="fade-up"
            >
              {ctaHeading}
            </h2>
            <p
              className="text-slate-300 text-lg md:text-xl leading-relaxed mb-10"
              data-animate="fade-up"
              data-delay="150"
            >
              {ctaSubheading}
            </p>
            <div className="flex flex-wrap gap-4" data-animate="fade-up" data-delay="300">
              <Link href="/contacto" className="btn-primary">
                {ctaPrimary}
              </Link>
              <Link href="/montajes" className="btn-outline-white">
                {ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== GALLERY BENTO ===== */}
      <section className="section-pad bg-igb-surface" id="galeria-preview">
        <div className="container-igb">
          <div
            className="flex flex-col items-start gap-6 mb-14 lg:flex-row lg:justify-between lg:items-end"
            data-animate="fade-up"
          >
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
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 md:h-[600px]">
            {galleryItems.map((item, i) => (
              <div
                key={item.src}
                className={`relative overflow-hidden rounded-xl ${item.span || ''}`}
                style={{ minHeight: i === 0 ? undefined : '200px' }}
                data-animate="scale"
              >
                <Picture
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes={
                    i === 0
                      ? '(max-width: 768px) 100vw, 50vw'
                      : '(max-width: 768px) 100vw, 25vw'
                  }
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

      {/* ===== CLIENTES DESTACADOS ===== */}
      <section className="section-pad bg-igb-surface-low" id="clientes-preview">
        <div className="container-igb">
          <div className="text-center mb-14" data-animate="fade-up">
            <span className="label-tag text-center flex justify-center">{cdLabel}</span>
            <h2 className="heading-display">{cdHeading}</h2>
            <p className="text-body-lg mt-3 max-w-xl mx-auto">{cdSubheading}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center">
            {clientes.map((cliente) => (
              <Link
                key={cliente.slug}
                href={`/clientes/${cliente.slug}`}
                className="bg-white rounded-xl p-6 flex items-center justify-center h-28 border border-slate-100 shadow-sm grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:shadow-md transition-all duration-300 group"
                data-animate="scale"
              >
                <Image
                  src={cliente.logo}
                  alt={`Logo ${cliente.name}`}
                  width={140}
                  height={60}
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 15vw"
                  quality={70}
                  loading="lazy"
                  className="object-contain h-full w-full max-h-12 transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center" data-animate="fade-up" data-delay="150">
            <Link href="/clientes" className="btn-outline">
              Ver todos nuestros clientes
            </Link>
          </div>
        </div>
      </section>

      {/* ===== LOCATION ===== */}
      <section className="section-pad bg-igb-surface" id="ubicacion">
        <div className="container-igb">
          <div className="text-center mb-12" data-animate="fade-up">
            <span className="label-tag flex justify-center">{ubicLabel}</span>
            <h2 className="heading-display">{ubicHeading}</h2>
            <p className="text-body-lg mt-3 max-w-xl mx-auto">{ubicSubheading}</p>
          </div>

          <div className="rounded-xl overflow-hidden shadow-igb" data-animate="fade-up" data-delay="150">
            <LazyGoogleMap />
          </div>
        </div>
      </section>
    </>
  )
}
