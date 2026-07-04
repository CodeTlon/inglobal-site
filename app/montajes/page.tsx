import type { Metadata } from 'next'
import Image from 'next/image'
import Picture from '@/components/Picture'
import Link from 'next/link'
import { getMontajes } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Montajes Industriales',
  description: 'Casos de estudio y proyectos de montajes industriales realizados por Grúas InGlobal S.R.L.',
}

export default async function MontajesPage() {
  const montajes = await getMontajes()

  return (
    <main className="bg-white">
      {/* Header */}
      <section className="pt-40 pb-20 bg-zinc-50 border-b border-zinc-100">
        <div className="container-igb">
          <span
            className="text-igb-yellow-dark text-xs font-bold tracking-[0.2em] uppercase mb-4 block"
            data-animate="fade-up"
          >
            Portafolio de Proyectos
          </span>
          <h1
            className="text-5xl md:text-6xl font-headline font-extrabold text-zinc-900 tracking-tight mb-6"
            data-animate="fade-up"
            data-delay="100"
          >
            Casos de Éxito
          </h1>
          <p
            className="text-xl text-zinc-500 max-w-2xl leading-relaxed"
            data-animate="fade-up"
            data-delay="200"
          >
            Ingeniería aplicada a desafíos complejos. Cada proyecto es un testimonio de nuestra precisión técnica y compromiso con la seguridad.
          </p>
        </div>
      </section>

      {/* Montajes Grid */}
      <section className="py-24">
        <div className="container-igb">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
            {montajes.map((montaje) => {
              const isRemoteImg = montaje.cover_image?.startsWith('http')
              return (
                <Link
                  key={montaje.slug}
                  href={`/montajes/${montaje.slug}`}
                  className="group flex flex-col h-full"
                  data-animate="fade-up"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden rounded-2xl bg-zinc-100 aspect-[16/10] mb-8">
                    {montaje.cover_image ? (
                      isRemoteImg ? (
                        <Image
                          src={montaje.cover_image}
                          alt={montaje.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                      ) : (
                        <Picture
                          src={montaje.cover_image}
                          alt={montaje.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                      )
                    ) : (
                      <div className="w-full h-full bg-zinc-200" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-grow">
                    <h2 className="text-2xl font-headline font-bold text-zinc-900 mb-4 tracking-tight group-hover:text-igb-yellow-dark transition-colors duration-300">
                      {montaje.title}
                    </h2>
                    <p className="text-zinc-500 text-lg leading-relaxed mb-8">
                      {montaje.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-auto">
                      {montaje.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 border border-zinc-200 px-3 py-1 rounded-md transition-colors duration-200 group-hover:border-igb-yellow/40 group-hover:text-igb-yellow-dark"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              )
            })}
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
