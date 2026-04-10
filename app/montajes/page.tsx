import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Montajes Industriales',
  description: 'Casos de estudio y proyectos de montajes industriales realizados por Grúas InGlobal S.R.L.',
}

const montajes = [
  {
    title: 'Traslado de Vagón Histórico',
    desc: 'Operación logística integral utilizando grúas telescópicas de alta capacidad para el posicionamiento de patrimonio ferroviario.',
    img: '/images/igb-3.webp',
    tags: ['Córdoba', 'Telescópicas', 'Patrimonio'],
  },
  {
    title: 'Estructura Navideña Gigante',
    desc: 'Montaje de precisión en zona urbana. Trabajo nocturno coordinado con múltiples equipos de izaje y seguridad.',
    img: '/images/igb-4.webp',
    tags: ['Eventos', 'Estructura', 'Izaje'],
  },
  {
    title: 'Instalación en Planta Industrial',
    desc: 'Posicionamiento de equipos de producción mediante maniobras coordinadas en espacios reducidos.',
    img: '/images/igb-5.webp',
    tags: ['Industrial', 'Planta', 'Precisión'],
  },
  {
    title: 'Silos en Planta Petroquímica',
    desc: 'Izaje y montaje de estructuras verticales de gran envergadura con personal especializado en altura.',
    img: '/images/igb-10.webp',
    tags: ['Petroquímica', 'Silos', 'Montaje'],
  },
  {
    title: 'Tanque Industrial de Gran Porte',
    desc: 'Planificación técnica para el izaje de tanques en condiciones de espacio críticas. Ejecución impecable.',
    img: '/images/igb-9.webp',
    tags: ['Industrial', 'Tanque', 'Izaje'],
  },
  {
    title: 'Estructura Metálica de Altura',
    desc: 'Montaje simultáneo de pórticos metálicos para naves industriales de logística avanzada.',
    img: '/images/igb-8.webp',
    tags: ['Logística', 'Altura', 'Estructuras'],
  },
]

export default function MontajesPage() {
  return (
    <main className="bg-white">
      {/* Header Minimalista - Sin imagen pesada, mucho aire */}
      <section className="pt-40 pb-20 bg-zinc-50 border-b border-zinc-100">
        <div className="container-igb">
          <span className="text-igb-yellow-dark text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
            Portafolio de Proyectos
          </span>
          <h1 className="text-5xl md:text-6xl font-headline font-extrabold text-zinc-900 tracking-tight mb-6">
            Casos de Éxito
          </h1>
          <p className="text-xl text-zinc-500 max-w-2xl leading-relaxed">
            Ingeniería aplicada a desafíos complejos. Cada proyecto es un testimonio de nuestra precisión técnica y compromiso con la seguridad.
          </p>
        </div>
      </section>

      {/* Montajes Grid - 2 columnas para que las fotos luzcan grandes */}
      <section className="py-24">
        <div className="container-igb">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
            {montajes.map((montaje) => (
              <article key={montaje.title} className="group flex flex-col h-full">
                {/* Imagen más grande y limpia */}
                <div className="relative overflow-hidden rounded-2xl bg-zinc-100 aspect-[16/10] mb-8">
                  <Image
                    src={montaje.img}
                    alt={montaje.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>

                {/* Contenido con flex-grow para alinear los tags */}
                <div className="flex flex-col flex-grow">
                  <h2 className="text-2xl font-headline font-bold text-zinc-900 mb-4 tracking-tight group-hover:text-igb-yellow-dark transition-colors">
                    {montaje.title}
                  </h2>
                  <p className="text-zinc-500 text-lg leading-relaxed mb-8">
                    {montaje.desc}
                  </p>

                  {/* Tags al mismo nivel (piso) */}
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {montaje.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 border border-zinc-200 px-3 py-1 rounded-md"
                      >
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

      {/* Final CTA - Minimalista y Centrado */}
      <section className="py-24 bg-zinc-100">
        <div className="container-igb text-center">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-zinc-900 tracking-tight mb-6">
            ¿Tu proyecto es el próximo desafío?
          </h2>
          <p className="text-zinc-600 text-lg max-w-xl mx-auto mb-10">
            Contactanos para recibir asesoramiento técnico especializado y presupuesto a medida.
          </p>
          <Link 
            href="/contacto" 
            className="btn-primary inline-block px-12 py-4 text-lg shadow-lg shadow-igb-yellow/20 transition-all hover:-translate-y-1"
          >
            Consultanos ahora
          </Link>
        </div>
      </section>
    </main>
  )
}