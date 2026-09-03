import type { Metadata } from 'next'
import Image from 'next/image'
import Picture from '@/components/Picture'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getMontaje, getMontajes } from '@/lib/content'
import { sanitizeHtml } from '@/lib/sanitize'
import TLDRBox from '@/components/TLDRBox'
import ShareButton from '@/components/ShareButton'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const montajes = await getMontajes()
    return montajes.map((m) => ({ slug: m.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const montaje = await getMontaje(slug)
    if (!montaje) return { title: 'Montaje no encontrado' }
    const tagsText = montaje.tags?.length ? ` — ${montaje.tags.join(', ')}` : ''
    return {
      title: `${montaje.title} | Caso de éxito`,
      description: `${montaje.excerpt ?? ''}${tagsText} Servicio de montaje industrial realizado por Grúas InGlobal S.R.L.`.trim(),
      openGraph: {
        title: montaje.title,
        description: montaje.excerpt ?? undefined,
        images: (montaje.banner_image ?? montaje.cover_image)
          ? [{ url: (montaje.banner_image ?? montaje.cover_image)! }]
          : [],
      },
    }
  } catch {
    return { title: 'Montaje' }
  }
}

export default async function MontajeDetailPage({ params }: Props) {
  const { slug } = await params
  const [montaje, todos] = await Promise.all([getMontaje(slug), getMontajes()])

  if (!montaje) notFound()

  // Relacionados: mismo tag, mismo montaje excluido, tope 3 — si no hay tags en común
  // caemos a los siguientes por display_order para no dejar la sección vacía.
  const relacionados = (() => {
    const otros = todos.filter((m) => m.slug !== montaje.slug)
    const porTag = otros.filter((m) => m.tags?.some((t) => montaje.tags?.includes(t)))
    const resto = otros.filter((m) => !porTag.includes(m))
    return [...porTag, ...resto].slice(0, 3)
  })()

  const tldrItems = [
    montaje.excerpt,
    montaje.tags?.length ? `Categoría: ${montaje.tags.join(', ')}` : null,
    'Operadores y equipos certificados, planificación técnica previa al izaje.',
  ].filter((item): item is string => Boolean(item))

  const heroImage = montaje.banner_image ?? montaje.cover_image
  const heroImageFocal = montaje.banner_image ? montaje.banner_image_focal : montaje.cover_image_focal
  const heroImageFocalMobile = montaje.banner_image ? montaje.banner_image_focal_mobile : montaje.cover_image_focal_mobile
  const isRemoteImg = heroImage?.startsWith('http')
  const focalStyle = {
    '--focal-desktop': heroImageFocal ?? undefined,
    '--focal-mobile': heroImageFocalMobile ?? undefined,
  } as React.CSSProperties

  return (
    <main className="bg-white">
      {/* Hero header con imagen de portada */}
      <section className="relative pt-40 pb-0 bg-zinc-900" data-navbar="dark">
        <div className="container-igb pb-12">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold text-white tracking-tight mb-6 max-w-3xl"
            data-animate="blur-up"
          >
            {montaje.title}
          </h1>

          <p
            className="text-xl text-slate-400 max-w-2xl leading-relaxed"
            data-animate="fade-up"
            data-delay="100"
          >
            {montaje.excerpt}
          </p>
        </div>

        {/* Banner image (o portada si no hay banner propio) */}
        {heroImage && (
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] min-h-[280px] md:min-h-[420px] overflow-hidden">
            {isRemoteImg ? (
              <Image
                src={heroImage}
                alt={montaje.title}
                fill
                priority
                sizes="100vw"
                className="object-cover hero-bg-zoom focal-responsive"
                style={focalStyle}
              />
            ) : (
              <Picture
                src={heroImage}
                alt={montaje.title}
                fill
                priority
                sizes="100vw"
                className="object-cover hero-bg-zoom focal-responsive"
                style={focalStyle}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}
      </section>

      {/* Content */}
      <section className="py-24">
        <div className="container-igb max-w-3xl">
          <TLDRBox items={tldrItems} />

          <div className="prose-igb" dangerouslySetInnerHTML={{ __html: sanitizeHtml(montaje.content || montaje.excerpt || '') }} />

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <ShareButton title={montaje.title} text={montaje.excerpt ?? undefined} />
            <Link
              href="/servicios"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-5 py-3 text-sm font-bold text-zinc-700 transition-colors hover:border-igb-yellow/40 hover:text-igb-yellow-dark active:scale-[0.98]"
            >
              Ver servicios relacionados
            </Link>
          </div>

          {/* Back + CTA */}
          <div className="mt-16 pt-10 border-t border-zinc-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Link
              href="/montajes"
              className="text-igb-yellow-dark font-bold font-headline text-sm flex items-center gap-2 hover:gap-3 transition-all"
            >
              ← Volver a Montajes
            </Link>
            <Link href="/contacto" className="btn-primary transition-all hover:-translate-y-0.5">
              Consultar proyecto similar
            </Link>
          </div>
        </div>
      </section>

      {/* Montajes relacionados */}
      {relacionados.length > 0 && (
        <section className="py-20 bg-zinc-50 border-y border-zinc-100">
          <div className="container-igb">
            <div className="mb-10" data-animate="fade-up">
              <span className="label-tag">Seguí explorando</span>
              <h2 className="heading-display">Otros montajes de InGlobal</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relacionados.map((m) => (
                <Link
                  key={m.slug}
                  href={`/montajes/${m.slug}`}
                  className="group block"
                  data-animate="fade-up"
                >
                  <div className="relative overflow-hidden rounded-xl bg-zinc-200 aspect-[16/10] mb-4">
                    {m.cover_image && (
                      m.cover_image.startsWith('http') ? (
                        <Image
                          src={m.cover_image}
                          alt={m.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <Picture
                          src={m.cover_image}
                          alt={m.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )
                    )}
                  </div>
                  <h3 className="font-headline font-bold text-lg text-zinc-900 group-hover:text-igb-yellow-dark transition-colors">
                    {m.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-24 bg-zinc-100">
        <div className="container-igb text-center">
          <h2
            className="text-3xl md:text-4xl font-headline font-bold text-zinc-900 tracking-tight mb-6"
            data-animate="fade-up"
          >
            ¿Tu proyecto es el próximo desafío?
          </h2>
          <p
            className="text-zinc-600 text-lg max-w-xl mx-auto mb-10"
            data-animate="fade-up"
            data-delay="150"
          >
            Contactanos para recibir asesoramiento técnico especializado y presupuesto a medida.
          </p>
          <Link
            href="/contacto"
            className="btn-primary inline-block px-12 py-4 text-lg shadow-lg shadow-igb-yellow/20 transition-all hover:-translate-y-1"
            data-animate="scale"
            data-delay="250"
          >
            Consultanos ahora
          </Link>
        </div>
      </section>
    </main>
  )
}
