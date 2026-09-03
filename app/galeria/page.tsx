import type { Metadata } from 'next'
import Image from 'next/image'
import Picture from '@/components/Picture'
import Link from 'next/link'
import { getGaleria, getSiteSettings } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Galería de Trabajos',
  description: 'Registro visual de izajes, montajes industriales y logística pesada de Grúas InGlobal S.R.L.',
}

const COL_SPAN_DESKTOP: Record<number, string> = {
  1: '',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
}

const ROW_SPAN_DESKTOP: Record<number, string> = { 1: '', 2: 'md:row-span-2' }
const COL_SPAN_MOBILE: Record<number, string> = { 1: '', 2: 'col-span-2' }
const ROW_SPAN_MOBILE: Record<number, string> = { 1: '', 2: 'row-span-2' }

export default async function GaleriaPage() {
  const galeria = await getGaleria()
  const s = await getSiteSettings('galeria_header')

  return (
    <main className="bg-white">
      {/* Page Header */}
      <section className="pt-40 pb-20 bg-zinc-50 border-b border-zinc-100">
        <div className="container-igb">
          <span
            className="text-igb-yellow-dark text-xs font-bold tracking-[0.2em] uppercase mb-4 block"
            data-animate="fade-up"
          >
            {(s.label as string) || 'Nuestros Proyectos en Imágenes'}
          </span>
          <h1
            className="text-5xl md:text-6xl font-headline font-extrabold text-zinc-900 tracking-tight mb-6 leading-tight"
            data-animate="blur-up"
            data-delay="100"
          >
            {(s.heading as string) || 'Portafolio Operativo'}
          </h1>
          <p
            className="text-xl text-zinc-500 max-w-2xl leading-relaxed"
            data-animate="fade-up"
            data-delay="200"
          >
            {(s.subheading as string) || 'Soluciones de ingeniería en movimiento con equipos certificados y operadores expertos en toda Argentina.'}
          </p>
        </div>
      </section>

      {/* Gallery Grid — items staggered */}
      <section className="py-24">
        <div className="container-igb">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 auto-rows-[250px]">
            {galeria.map((item, i) => {
              const isRemote = item.imagen.startsWith('http')
              const span = [
                COL_SPAN_MOBILE[item.col_span_mobile],
                ROW_SPAN_MOBILE[item.row_span_mobile],
                COL_SPAN_DESKTOP[item.col_span_desktop],
                ROW_SPAN_DESKTOP[item.row_span_desktop],
              ].join(' ')

              return (
                <div
                  key={item.id}
                  className={`relative overflow-hidden rounded-2xl bg-zinc-100 group shadow-sm ${span}`}
                  data-animate="scale"
                >
                  {isRemote ? (
                    <Image
                      src={item.imagen}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                      priority={i === 0}
                    />
                  ) : (
                    <Picture
                      src={item.imagen}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                      priority={i === 0}
                    />
                  )}

                  {/* Overlay caption */}
                  <div className="absolute inset-0 bg-zinc-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                    <p className="text-white text-sm font-medium tracking-wide">
                      {item.alt}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-zinc-100">
        <div className="container-igb flex flex-col items-center text-center gap-10 lg:flex-row lg:justify-between lg:text-left">

          <div className="max-w-xl" data-animate="fade-up">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-zinc-900 tracking-tight mb-4">
              {(s.cta_heading as string) || '¿Su proyecto requiere esta precisión?'}
            </h2>
            <p className="text-zinc-600 text-lg">
              {(s.cta_subheading as string) || 'Llevamos nuestra experiencia técnica y seguridad certificada a su próximo desafío industrial.'}
            </p>
          </div>

          <Link
            href="/contacto"
            className="btn-primary whitespace-nowrap px-10 py-4 text-lg shadow-lg shadow-igb-yellow/20 transition-all hover:-translate-y-1"
            data-animate="scale"
            data-delay="150"
          >
            {(s.cta_button as string) || 'Solicitar Presupuesto'}
          </Link>

        </div>
      </section>
    </main>
  )
}
