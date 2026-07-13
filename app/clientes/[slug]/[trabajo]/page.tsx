import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import { getCliente, getClientes, getTrabajo, getTrabajos } from '@/lib/content'
import { youtubeEmbedUrl } from '@/lib/youtube'
import { sanitizeHtml } from '@/lib/sanitize'

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
    return {
      title: `${trabajo.title} — ${cliente.name}`,
      description: trabajo.excerpt ?? undefined,
      openGraph: {
        title: trabajo.title,
        description: trabajo.excerpt ?? undefined,
        images: trabajo.cover_image ? [{ url: trabajo.cover_image }] : [],
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

  const ytEmbed = youtubeEmbedUrl(trabajo.youtube_url)
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
      {trabajo.cover_image ? (
        <section className="relative overflow-hidden" style={{ height: '55vh', minHeight: '360px' }}>
          <Image
            src={trabajo.cover_image}
            alt={trabajo.title}
            fill
            priority
            sizes="100vw"
            className="object-cover hero-bg-zoom"
            style={{ objectPosition: trabajo.cover_image_focal ?? undefined }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/80" />
          <div className="absolute bottom-0 left-0 right-0 pb-12">
            <div className="container-igb">
              <span
                className="text-igb-yellow text-xs font-bold tracking-[0.2em] uppercase mb-3 block"
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
              className="text-igb-yellow-dark text-xs font-bold tracking-[0.2em] uppercase mb-3 block"
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

          {ytEmbed && (
            <div className="relative w-full mb-10 rounded-xl overflow-hidden bg-black" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={ytEmbed}
                title={trabajo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 w-full h-full"
              />
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

          <div className="mt-12 pt-8 border-t border-zinc-100">
            <Link
              href={`/clientes/${cliente.slug}`}
              className="inline-flex items-center gap-2 text-igb-yellow-dark hover:text-zinc-900 transition-colors font-bold font-headline text-sm"
            >
              <ArrowLeft size={16} /> Volver a {cliente.name}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
