import type { Metadata } from 'next'
import Image from 'next/image'
import Picture from '@/components/Picture'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getMontaje, getMontajes } from '@/lib/content'
import { sanitizeHtml } from '@/lib/sanitize'

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
    return {
      title: montaje.title,
      description: montaje.excerpt,
    }
  } catch {
    return { title: 'Montaje' }
  }
}

export default async function MontajeDetailPage({ params }: Props) {
  const { slug } = await params
  const montaje = await getMontaje(slug)

  if (!montaje) notFound()

  const heroImage = montaje.banner_image ?? montaje.cover_image
  const heroImageFocal = montaje.banner_image ? montaje.banner_image_focal : montaje.cover_image_focal
  const isRemoteImg = heroImage?.startsWith('http')

  return (
    <main className="bg-white">
      {/* Hero header con imagen de portada */}
      <section className="relative pt-40 pb-0 bg-zinc-900" data-navbar="dark">
        <div className="container-igb pb-12">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6" data-animate="fade-up">
            {montaje.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] uppercase tracking-widest font-bold text-igb-yellow border border-igb-yellow/40 px-3 py-1 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold text-white tracking-tight mb-6 max-w-3xl"
            data-animate="blur-up"
            data-delay="100"
          >
            {montaje.title}
          </h1>

          <p
            className="text-xl text-slate-400 max-w-2xl leading-relaxed"
            data-animate="fade-up"
            data-delay="200"
          >
            {montaje.excerpt}
          </p>
        </div>

        {/* Banner image (o portada si no hay banner propio) */}
        {heroImage && (
          <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
            {isRemoteImg ? (
              <Image
                src={heroImage}
                alt={montaje.title}
                fill
                priority
                sizes="100vw"
                className="object-cover hero-bg-zoom"
                style={{ objectPosition: heroImageFocal ?? undefined }}
              />
            ) : (
              <Picture
                src={heroImage}
                alt={montaje.title}
                fill
                priority
                sizes="100vw"
                className="object-cover hero-bg-zoom"
                style={{ objectPosition: heroImageFocal ?? undefined }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}
      </section>

      {/* Content */}
      <section className="py-24">
        <div className="container-igb max-w-3xl">
          <div className="prose-igb" dangerouslySetInnerHTML={{ __html: sanitizeHtml(montaje.content || montaje.excerpt || '') }} />

          {/* Back + CTA */}
          <div className="mt-16 pt-10 border-t border-zinc-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Link
              href="/montajes"
              className="text-igb-yellow-dark font-bold font-headline text-sm flex items-center gap-2 hover:gap-3 transition-all"
            >
              ← Volver a Montajes
            </Link>
            <Link href="/contacto" className="btn-primary">
              Consultar proyecto similar
            </Link>
          </div>
        </div>
      </section>

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
