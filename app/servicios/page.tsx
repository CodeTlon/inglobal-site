import type { Metadata } from 'next'
import Picture from '@/components/Picture'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Servicios',
  description: 'Grúas telescópicas, hidrogrúas, movimientos pesados y traslados con carretones.',
}

const services = [
  {
    id: 'gruas-telescopicas',
    title: 'Grúas Telescópicas',
    desc: 'Equipos de alta performance para elevación y movimiento de cargas pesadas en obras industriales y de construcción. Contamos con grúas de 3 a 200 toneladas de capacidad y hasta 100 metros de altura.',
    specs: ['3 a 200 Tn de capacidad', 'Hasta 100m de altura', 'Certificación vigente', 'Operadores capacitados'],
    img: '/images/igb-1.webp',
  },
  {
    id: 'hidrogruas',
    title: 'Hidrogrúas',
    desc: 'Hidrogrúas montadas con barquilla para trabajos en altura, mantenimiento industrial y montajes especiales. Ideales para acceder a zonas de difícil alcance con total seguridad.',
    specs: ['Barquilla incluida', 'Acceso a zonas complejas', 'Mantenimiento industrial', 'Montajes especiales'],
    img: '/images/igb-2.webp',
  },
  {
    id: 'movimientos-pesados',
    title: 'Movimientos Pesados',
    desc: 'Trabajos especiales de movimiento y posicionamiento de estructuras de gran envergadura y peso considerable. Cada proyecto es planificado a medida según las necesidades del cliente.',
    specs: ['Planificación personalizada', 'Estructuras de gran envergadura', 'Personal especializado', 'Seguridad certificada'],
    img: '/images/igb-7.webp',
  },
  {
    id: 'traslados',
    title: 'Traslados con Carretones',
    desc: 'Servicio de transporte de maquinarias y estructuras pesadas con carretones especializados a todo el país. Logística integral para garantizar que tu carga llegue en tiempo y forma.',
    specs: ['Cobertura nacional', 'Maquinaria pesada', 'Carretones especializados', 'Logística integral'],
    img: '/images/igb-3.webp',
  },
]

export default function ServiciosPage() {
  return (
    <main className="bg-white">
      {/* Page Header */}
      <section className="pt-40 pb-20 bg-zinc-50 border-b border-zinc-100">
        <div className="container-igb">
          <span
            className="text-igb-yellow-dark text-xs font-bold tracking-[0.2em] uppercase mb-4 block"
            data-animate="fade-up"
          >
            Nuestras Soluciones
          </span>
          <h1
            className="text-5xl md:text-6xl font-headline font-extrabold text-zinc-900 tracking-tight mb-6"
            data-animate="fade-up"
            data-delay="100"
          >
            Nuestros Servicios
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

      {/* Services List */}
      <section className="py-24">
        <div className="container-igb space-y-32 md:space-y-48">
          {services.map((service, i) => {
            const isEven = i % 2 === 1
            return (
              <div
                key={service.id}
                id={service.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center"
              >
                {/* Image column */}
                <div
                  className={`lg:col-span-7 ${isEven ? 'lg:order-2' : ''}`}
                  data-animate={isEven ? 'from-left' : 'from-right'}
                >
                  <div className="relative overflow-hidden rounded-2xl bg-slate-100 shadow-2xl shadow-slate-200/50">
                    <Picture
                      src={service.img}
                      alt={service.title}
                      width={1000}
                      height={600}
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      priority={i === 0}
                      className="object-cover w-full aspect-[16/10] hover:scale-105 transition-transform duration-1000"
                    />
                  </div>
                </div>

                {/* Text column */}
                <div className={`lg:col-span-5 ${isEven ? 'lg:order-1' : ''}`}>
                  <h2
                    className="text-4xl font-headline font-bold text-slate-900 mb-6 tracking-tight"
                    data-animate="fade-up"
                  >
                    {service.title}
                  </h2>
                  <p
                    className="text-slate-600 text-lg leading-relaxed mb-10"
                    data-animate="fade-up"
                    data-delay="100"
                  >
                    {service.desc}
                  </p>

                  <ul
                    className="space-y-4 mb-10 border-l-2 border-igb-yellow pl-6"
                    data-animate="fade-up"
                    data-delay="200"
                  >
                    {service.specs.map((spec) => (
                      <li key={spec} className="text-slate-800 font-medium">
                        {spec}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8" data-animate="fade-up" data-delay="300">
                    <Link
                      href={`/contacto?servicio=${service.id}`}
                      className="btn-primary px-8 py-4 inline-block text-center"
                    >
                      Consultar disponibilidad
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-zinc-100">
        <div className="container-igb flex flex-col items-center text-center gap-10 lg:flex-row lg:justify-between lg:text-left">

          <div className="max-w-xl" data-animate="fade-up">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4 text-zinc-900 tracking-tight">
              ¿Listo para comenzar su proyecto?
            </h2>
            <p className="text-zinc-600 text-lg">
              Asesoramiento técnico personalizado para cada necesidad de izaje.
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
