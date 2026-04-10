import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Galería',
  description: 'Galería de imágenes de operaciones de grúas, montajes industriales y trabajos especiales realizados por Grúas InGlobal S.R.L.',
}

const gallery = [
  { src: '/images/igb-1.webp', alt: 'Grúa telescópica con bandera argentina', large: true },
  { src: '/images/igb-2.webp', alt: 'Hidrogrúa levantando plataforma elevadora' },
  { src: '/images/igb-3.webp', alt: 'Traslado de vagón de tren' },
  { src: '/images/igb-4.webp', alt: 'Montaje de árbol navideño gigante' },
  { src: '/images/igb-5.webp', alt: 'Grúas en planta industrial' },
  { src: '/images/igb-6.webp', alt: 'Instalación de cartelería' },
  { src: '/images/igb-7.webp', alt: 'Montaje industrial con plataforma', large: true },
  { src: '/images/igb-8.webp', alt: 'Instalación de estructura metálica' },
  { src: '/images/igb-9.webp', alt: 'Izaje de tanque industrial al atardecer' },
  { src: '/images/igb-10.webp', alt: 'Montaje de silo en planta petroquímica' },
]

export default function GaleriaPage() {
  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 bg-igb-surface-low">
        <div className="container-igb">
          <span className="label-tag">Nuestro trabajo en imágenes</span>
          <h1 className="heading-display mb-4">Galería</h1>
          <p className="text-body-lg max-w-2xl">
            Cada imagen cuenta una historia de precisión, seguridad y compromiso con el resultado. Así trabajamos en Grúas InGlobal.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="section-pad bg-igb-surface">
        <div className="container-igb">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {gallery.map((item) => (
              <div
                key={item.src}
                className={`relative overflow-hidden rounded-xl group break-inside-avoid ${
                  item.large ? 'aspect-[4/3]' : 'aspect-[3/2]'
                }`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  quality={85}
                  className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm font-medium">{item.alt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad bg-igb-surface-low">
        <div className="container-igb text-center">
          <h2 className="heading-display mb-4">¿Querés trabajar con nosotros?</h2>
          <p className="text-body-lg max-w-xl mx-auto mb-8">
            Contactanos y te asesoramos para tu próximo proyecto de elevación o montaje.
          </p>
          <Link href="/contacto" className="btn-primary mx-auto">
            Solicitar Presupuesto
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
