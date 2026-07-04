import type { Metadata } from 'next'
import Picture from '@/components/Picture'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Portafolio Operativo',
  description: 'Registro visual de izajes, montajes industriales y logística pesada de Grúas InGlobal S.R.L.',
}

const galleryItems = [
  // Fila 1 - igb-1 featured (2x2 span)
  { src: '/images/igb-1.webp', alt: 'Grúa telescópica principal en operación', span: 'md:col-span-2 md:row-span-2' },
  // Fila 1 y 2 - Filler
  { src: '/images/igb-2.webp', alt: 'Hidrogrúa con barquilla en planta industrial' },
  { src: '/images/igb-3.webp', alt: 'Traslado de maquinaria con carretón pesado' },
  { src: '/images/igb-4.webp', alt: 'Montaje de silos en petroquímica' },
  { src: '/images/igb-5.webp', alt: 'Par de grúas operando en tándem' },

  // Fila 3 - Standard Grid
  { src: '/images/igb-6.webp', alt: 'Izaje de estructura metálica en altura' },
  // Horizontal featured (2 cols)
  { src: '/images/igb-7.webp', alt: 'Grúa en muelle industrial', span: 'md:col-span-2' },
  { src: '/images/igb-8.webp', alt: 'Mantenimiento preventivo en obra' },

  // Fila 4 - Mixed spans
  { src: '/images/igb-9.webp', alt: 'Izaje nocturno en planta' },
  { src: '/images/igb-10.webp', alt: 'Grúa telescópica en parque eólico' },
  { src: '/images/igb-1.webp', alt: 'Grúa telescópica principal (Placeholder)' },
  { src: '/images/igb-7.webp', alt: 'Grúa en muelle (Placeholder)' },
]

export default function GaleriaPage() {
  return (
    <main className="bg-white">
      {/* Page Header */}
      <section className="pt-40 pb-20 bg-zinc-50 border-b border-zinc-100">
        <div className="container-igb">
          <span
            className="text-igb-yellow-dark text-xs font-bold tracking-[0.2em] uppercase mb-4 block"
            data-animate="fade-up"
          >
            Nuestros Proyectos en Imágenes
          </span>
          <h1
            className="text-5xl md:text-6xl font-headline font-extrabold text-zinc-900 tracking-tight mb-6 leading-tight"
            data-animate="fade-up"
            data-delay="100"
          >
            Portafolio Operativo
          </h1>
          <p
            className="text-xl text-zinc-500 max-w-2xl leading-relaxed"
            data-animate="fade-up"
            data-delay="200"
          >
            Soluciones de ingeniería en movimiento con equipos certificados y operadores expertos en toda Argentina.
          </p>
        </div>
      </section>

      {/* Gallery Grid — items staggered */}
      <section className="py-24">
        <div className="container-igb">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 auto-rows-[250px]">
            {galleryItems.map((item, i) => (
              <div
                key={i}
                className={`relative overflow-hidden rounded-2xl bg-zinc-100 group shadow-sm ${item.span || ''}`}
                data-animate="scale"
              >
                <Picture
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                  priority={i === 0}
                />

                {/* Overlay caption */}
                <div className="absolute inset-0 bg-zinc-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                  <p className="text-white text-sm font-medium tracking-wide">
                    {item.alt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-zinc-100">
        <div className="container-igb flex flex-col items-center text-center gap-10 lg:flex-row lg:justify-between lg:text-left">

          <div className="max-w-xl" data-animate="fade-up">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-zinc-900 tracking-tight mb-4">
              ¿Su proyecto requiere esta precisión?
            </h2>
            <p className="text-zinc-600 text-lg">
              Llevamos nuestra experiencia técnica y seguridad certificada a su próximo desafío industrial.
            </p>
          </div>

          <Link
            href="/contacto"
            className="btn-primary whitespace-nowrap px-10 py-4 text-lg shadow-lg shadow-igb-yellow/20 transition-all hover:-translate-y-1"
            data-animate="scale"
            data-delay="150"
          >
            Solicitar Presupuesto
          </Link>

        </div>
      </section>
    </main>
  )
}
