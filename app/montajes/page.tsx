import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Tag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Montajes Industriales',
  description: 'Casos de estudio y proyectos de montajes industriales realizados por Grúas InGlobal S.R.L. en Córdoba y toda Argentina.',
}

const montajes = [
  {
    title: 'Traslado y Colocación de Vagón Histórico',
    desc: 'Realizamos el traslado y colocación de un vagón de tren histórico utilizando dos grúas telescópicas de alta capacidad. Trabajo integral que incluyó logística de transporte y montaje final.',
    img: '/images/igb-3.webp',
    tags: ['Córdoba', 'Grúa Telescópica', 'Patrimonio'],
  },
  {
    title: 'Montaje de Estructura Navideña Gigante',
    desc: 'Instalación del árbol de navidad del centro de la ciudad. Trabajo nocturno coordinado con múltiples equipos de izaje y posicionamiento de precisión.',
    img: '/images/igb-4.webp',
    tags: ['Eventos', 'Estructura Metálica', 'Izaje'],
  },
  {
    title: 'Instalación de Equipos en Planta Industrial',
    desc: 'Trabajos especiales de instalación de equipos industriales utilizando múltiples grúas trabajando en conjunto. Máxima seguridad y precisión en cada operación.',
    img: '/images/igb-5.webp',
    tags: ['Industrial', 'Planta', 'Equipos'],
  },
  {
    title: 'Montaje de Silos en Planta Petroquímica',
    desc: 'Izaje y montaje de silos de gran envergadura en planta petroquímica. Trabajo coordinado con personal especializado y equipos de alta capacidad.',
    img: '/images/igb-10.webp',
    tags: ['Petroquímica', 'Silos', 'Montaje'],
  },
  {
    title: 'Izaje de Tanque Industrial al Atardecer',
    desc: 'Operación especial de izaje de tanque de gran porte en condiciones complejas de luminosidad y espacio. Planificación detallada y ejecución impecable.',
    img: '/images/igb-9.webp',
    tags: ['Industrial', 'Izaje', 'Tanque'],
  },
  {
    title: 'Instalación de Estructura Metálica',
    desc: 'Montaje de estructura metálica de gran envergadura coordinado con múltiples equipos de elevación trabajando en simultáneo.',
    img: '/images/igb-8.webp',
    tags: ['Estructura Metálica', 'Coordinado', 'Altura'],
  },
]

export default function MontajesPage() {
  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/igb-7.webp"
            alt="Montajes industriales InGlobal"
            fill
            sizes="100vw"
            quality={70}
            className="object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 container-igb">
          <span className="text-igb-yellow text-xs font-bold tracking-widest uppercase mb-4 block">
            Casos de Éxito
          </span>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-white tracking-tight mb-4">
            Montajes Industriales
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
            Nos gusta lo difícil, nos atrae lo complicado y logramos lo imposible. Más de 40 años de experiencia nos avalan.
          </p>
        </div>
      </section>

      {/* Montajes grid */}
      <section className="section-pad bg-igb-surface">
        <div className="container-igb">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {montajes.map((montaje) => (
              <article key={montaje.title} className="bg-white rounded-xl overflow-hidden shadow-igb group">
                <div className="relative overflow-hidden aspect-[16/10]">
                  <Image
                    src={montaje.img}
                    alt={montaje.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    quality={80}
                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-lg font-headline font-bold text-igb-on-surface mb-3 leading-tight">
                    {montaje.title}
                  </h2>
                  <p className="text-igb-secondary text-sm leading-relaxed mb-4">
                    {montaje.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {montaje.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 text-xs font-medium bg-igb-yellow/10 text-igb-yellow-dark px-2.5 py-1 rounded-full"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad bg-igb-surface-low">
        <div className="container-igb text-center">
          <h2 className="heading-display mb-4">¿Tu proyecto es el próximo?</h2>
          <p className="text-body-lg max-w-xl mx-auto mb-8">
            Contanos tu desafío y lo resolvemos con la experiencia y el equipo correcto.
          </p>
          <Link href="/contacto" className="btn-primary mx-auto">
            Consultanos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
