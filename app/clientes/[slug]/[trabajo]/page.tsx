import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import { getCliente, getClientes, getTrabajo, getTrabajos } from '@/lib/content'
import { youtubeEmbedUrl, parseYoutubeId } from '@/lib/youtube'
import { sanitizeHtml } from '@/lib/sanitize'
import LazyYoutubeEmbed from '@/components/LazyYoutubeEmbed'
import ShareButton from '@/components/ShareButton'

interface Props {
  params: Promise<{ slug: string; trabajo: string }>
}

export async function generateStaticParams() {
  try {
    const clientes = await getClientes()
    const params: { slug: string; trabajo: string }[] = []
    for (const c of clientes) {
      const trabajos = await getTrabajos(c.id)
      for (const t of trabajos) params.push({ slug: c.slug, trabajo: t.slug })
    }
    return params
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, trabajo: trabajoSlug } = await params
  try {
    const cliente = await getCliente(slug)
    if (!cliente) return { title: 'Trabajo no encontrado' }
    const trabajo = await getTrabajo(cliente.id, trabajoSlug)
    if (!trabajo) return { title: 'Trabajo no encontrado' }
    const fecha = trabajo.fecha
      ? new Date(`${trabajo.fecha}T00:00:00`).toLocaleDateString('es-AR', { year: 'numeric', month: 'long' })
      : null
    return {
      title: `${trabajo.title} — ${cliente.name}`,
      description:
        `${trabajo.excerpt ?? `${trabajo.title}, proyecto realizado para ${cliente.name}.`}${fecha ? ` Realizado en ${fecha}.` : ''} Grúas InGlobal S.R.L.`.trim(),
      openGraph: {
        title: trabajo.title,
        description: trabajo.excerpt ?? undefined,
        images: (trabajo.banner_image ?? trabajo.cover_image) ? [{ url: (trabajo.banner_image ?? trabajo.cover_image)! }] : [],
      },
    }
  } catch {
    return { title: 'Trabajo' }
  }
}

export default async function TrabajoDetailPage({ params }: Props) {
  const { slug, trabajo: trabajoSlug } = await params
  const cliente = await getCliente(slug)
  if (!cliente) notFound()

  const trabajo = await getTrabajo(cliente.id, trabajoSlug)
  if (!trabajo) notFound()

  const heroImage = trabajo.banner_image ?? trabajo.cover_image
  const heroImageFocal = trabajo.banner_image ? trabajo.banner_image_focal : trabajo.cover_image_focal
  const heroImageFocalMobile = trabajo.banner_image ? trabajo.banner_image_focal_mobile : trabajo.cover_image_focal_mobile
  const overlayOpacity = (trabajo.banner_overlay_opacity ?? 100) / 100
  const overlayOpacityMobile = trabajo.banner_overlay_opacity_mobile != null ? trabajo.banner_overlay_opacity_mobile / 100 : null
  const ytEmbed = youtubeEmbedUrl(trabajo.youtube_url)
  const ytId = parseYoutubeId(trabajo.youtube_url)
  const fechaFormateada = trabajo.fecha
    ? new Date(`${trabajo.fecha}T00:00:00`).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <main className="bg-white">
      {/* Hero */}
      {heroImage ? (
        <section
          className="relative overflow-hidden aspect-[16/9] md:aspect-[21/9] min-h-[280px] md:min-h-[420px]"
          data-navbar="hidden"
        >
          <Image
            src={heroImage}
            alt={trabajo.title}
            fill
            priority
            sizes="100vw"
            className="object-cover hero-bg-zoom focal-responsive"
            style={{
              '--focal-desktop': heroImageFocal ?? undefined,
              '--focal-mobile': heroImageFocalMobile ?? undefined,
            } as React.CSSProperties}
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/85 overlay-responsive"
            style={{
              '--overlay-desktop': overlayOpacity,
              '--overlay-mobile': overlayOpacityMobile ?? undefined,
            } as React.CSSProperties}
          />
          <div className="absolute bottom-0 left-0 right-0 pb-12">
            <div className="container-igb">
              <span
                className="block font-body italic text-lg text-white/90 mb-3"
                data-animate="fade-up"
              >
                {cliente.name}
              </span>
              <h1
                className="text-3xl md:text-5xl font-headline font-extrabold text-white max-w-3xl tracking-tight"
                data-animate="blur-up"
                data-delay="100"
              >
                {trabajo.title}
              </h1>
              {fechaFormateada && (
                <p className="text-slate-300 text-sm mt-3" data-animate="fade-up" data-delay="150">
                  {fechaFormateada}
                </p>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="pt-40 pb-12 bg-zinc-50 border-b border-zinc-100">
          <div className="container-igb">
            <span
              className="block font-body italic text-lg text-igb-navy mb-3"
              data-animate="fade-up"
            >
              {cliente.name}
            </span>
            <h1
              className="text-3xl md:text-5xl font-headline font-extrabold text-zinc-900 max-w-3xl tracking-tight"
              data-animate="blur-up"
              data-delay="100"
            >
              {trabajo.title}
            </h1>
            {fechaFormateada && (
              <p className="text-zinc-400 text-sm mt-3" data-animate="fade-up" data-delay="150">
                {fechaFormateada}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="container-igb max-w-3xl">
          {trabajo.excerpt && (
            <p className="text-zinc-600 text-xl leading-relaxed mb-10 border-l-4 border-igb-yellow pl-6">
              {trabajo.excerpt}
            </p>
          )}

          {ytEmbed && ytId && (
            <div className="relative w-full mb-10 rounded-xl overflow-hidden bg-black" style={{ paddingBottom: '56.25%' }}>
              <LazyYoutubeEmbed embedUrl={ytEmbed} videoId={ytId} title={trabajo.title} />
            </div>
          )}

          <div className="prose-igb" dangerouslySetInnerHTML={{ __html: sanitizeHtml(trabajo.content) }} />

          {trabajo.attachment_url && (
            <a
              href={trabajo.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-10 px-5 py-3 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-700 hover:text-igb-yellow-dark hover:border-igb-yellow/40 transition-colors font-bold text-sm"
            >
              <FileText size={16} /> Descargar PDF
            </a>
          )}

          <div className="mt-12 pt-8 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-4">
            <Link
              href={`/clientes/${cliente.slug}`}
              className="inline-flex items-center gap-2 text-igb-yellow-dark hover:text-zinc-900 transition-colors font-bold font-headline text-sm"
            >
              <ArrowLeft size={16} /> Volver a {cliente.name}
            </Link>
            <ShareButton title={`${trabajo.title} — ${cliente.name}`} text={trabajo.excerpt ?? undefined} />
          </div>
        </div>
      </section>
    </main>
  )
}
