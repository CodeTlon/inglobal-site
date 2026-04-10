import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Shield, Truck, Zap, ArrowUpRight, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Servicios',
  description: 'Grúas telescópicas, hidrogrúas, movimientos pesados y traslados con carretones. Equipos certificados para obras industriales en todo Argentina.',
}

const services = [
  {
    id: 'gruas-telescopicas',
    icon: ArrowUpRight,
    title: 'Grúas Telescópicas',
    tag: 'Servicio Principal',
    desc: 'Equipos de alta performance para elevación y movimiento de cargas pesadas en obras industriales y de construcción. Contamos con grúas de 3 a 200 toneladas de capacidad y hasta 100 metros de altura.',
    specs: ['3 a 200 Tn de capacidad', 'Hasta 100m de altura', 'Certificación vigente', 'Operadores capacitados'],
    img: '/images/igb-1.webp',
  },
  {
    id: 'hidrogruas',
    icon: Truck,
    title: 'Hidrogrúas',
    tag: 'Con Barquilla',
    desc: 'Hidrogrúas montadas con barquilla para trabajos en altura, mantenimiento industrial y montajes especiales. Ideales para acceder a zonas de difícil alcance con total seguridad.',
    specs: ['Barquilla incluida', 'Acceso a zonas complejas', 'Mantenimiento industrial', 'Montajes especiales'],
    img: '/images/igb-2.webp',
  },
  {
    id: 'movimientos-pesados',
    icon: Zap,
    title: 'Movimientos Pesados',
    tag: 'Trabajos Especiales',
    desc: 'Trabajos especiales de movimiento y posicionamiento de estructuras de gran envergadura y peso considerable. Cada proyecto es planificado a medida según las necesidades del cliente.',
    specs: ['Planificación personalizada', 'Estructuras de gran envergadura', 'Personal especializado', 'Seguridad certificada'],
    img: '/images/igb-7.webp',
  },
  {
    id: 'traslados',
    icon: Shield,
    title: 'Traslados con Carretones',
    tag: 'Cobertura Nacional',
    desc: 'Servicio de transporte de maquinarias y estructuras pesadas con carretones especializados a todo el país. Logística integral para garantizar que tu carga llegue en tiempo y forma.',
    specs: ['Cobertura nacional', 'Maquinaria pesada', 'Carretones especializados', 'Logística integral'],
    img: '/images/igb-3.webp',
  },
]

export default function ServiciosPage() {
  return (
    <>
      {/* Page Header */}
      <section className="pt-32 pb-16 bg-igb-surface-low">
        <div className="container-igb">
          <span className="label-tag">Lo que hacemos</span>
          <h1 className="heading-display mb-4">Nuestros Servicios</h1>
          <p className="text-body-lg max-w-2xl">
            Ofrecemos el alquiler de diferentes equipos para dar solución a las necesidades de nuestros clientes, con operadores y equipos certificados en toda Argentina.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="section-pad bg-igb-surface">
        <div className="container-igb space-y-24">
          {services.map((service, i) => {
            const Icon = service.icon
            const isEven = i % 2 === 1
            return (
              <div
                key={service.id}
                id={service.id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${isEven ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className={isEven ? 'lg:order-2' : ''}>
                  <Image
                    src={service.img}
                    alt={service.title}
                    width={600}
                    height={440}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    quality={85}
                    className="rounded-xl object-cover w-full aspect-[4/3]"
                  />
                </div>
                <div className={isEven ? 'lg:order-1' : ''}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-igb-yellow/20 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-igb-yellow-dark" />
                    </div>
                    <span className="text-xs font-bold text-igb-yellow-dark tracking-widest uppercase">
                      {service.tag}
                    </span>
                  </div>
                  <h2 className="text-3xl font-headline font-extrabold text-igb-on-surface tracking-tight mb-4">
                    {service.title}
                  </h2>
                  <p className="text-igb-secondary leading-relaxed mb-8">{service.desc}</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.specs.map((spec) => (
                      <li key={spec} className="flex items-center gap-2 text-sm text-igb-on-surface/80">
                        <CheckCircle className="w-4 h-4 text-igb-yellow-dark flex-shrink-0" />
                        {spec}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Link href={`/contacto?servicio=${service.id}`} className="btn-primary">
                      Consultar por este servicio
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad bg-igb-surface-low">
        <div className="container-igb text-center">
          <h2 className="heading-display mb-4">¿Necesitás un servicio?</h2>
          <p className="text-body-lg max-w-xl mx-auto mb-8">
            Contactanos y te asesoramos sin compromiso para encontrar la solución ideal.
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
