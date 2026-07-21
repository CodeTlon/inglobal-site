import type { Metadata } from 'next'
import Image from 'next/image'
import Picture from '@/components/Picture'
import Link from 'next/link'
import { getServicios } from '@/lib/content'
import {
  ArrowUpToLine,
  HardHat,
  Move,
  Truck,
  type LucideIcon,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Servicios',
  description: 'Grúas telescópicas, hidrogrúas, movimientos pesados y traslados con carretones.',
}

const ICON_MAP: Record<string, LucideIcon> = {
  ArrowUpToLine,
  HardHat,
  Move,
  Truck,
}

export default async function ServiciosPage() {
  const services = await getServicios()

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
            data-animate="blur-up"
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
            const isRemoteImg = service.img?.startsWith('http')
            const Icon = ICON_MAP[service.icon] ?? ArrowUpToLine
            const specs = Array.isArray(service.specs)
              ? service.specs
              : typeof service.specs === 'string'
              ? [service.specs]
              : []

            return (
              <div
                key={service.slug}
                id={service.slug}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center"
              >
                {/* Image column */}
                <div
                  className={`lg:col-span-7 ${isEven ? 'lg:order-2' : ''}`}
                  data-animate={isEven ? 'from-left' : 'from-right'}
                >
                  <div className="relative overflow-hidden rounded-2xl bg-slate-100 shadow-2xl shadow-slate-200/50">
                    {service.img ? (
                      isRemoteImg ? (
                        <Image
                          src={service.img}
                          alt={service.title}
                          width={1000}
                          height={600}
                          sizes="(max-width: 1024px) 100vw, 60vw"
                          priority={i === 0}
                          className="object-cover w-full aspect-[16/10] hover:scale-105 transition-transform duration-1000"
                        />
                      ) : (
                        <Picture
                          src={service.img}
                          alt={service.title}
                          width={1000}
                          height={600}
                          sizes="(max-width: 1024px) 100vw, 60vw"
                          priority={i === 0}
                          className="object-cover w-full aspect-[16/10] hover:scale-105 transition-transform duration-1000"
                        />
                      )
                    ) : (
                      <div className="w-full aspect-[16/10] bg-zinc-100 flex items-center justify-center">
                        <Icon className="w-16 h-16 text-zinc-300" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Text column */}
                <div className={`lg:col-span-5 ${isEven ? 'lg:order-1' : ''}`}>
                  <h2
                    className="text-4xl font-headline font-bold text-slate-900 mb-6 tracking-tight line-clamp-2"
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

                  {specs.length > 0 && (
                    <ul
                      className="space-y-4 mb-10 border-l-2 border-igb-yellow pl-6"
                      data-animate="fade-up"
                      data-delay="200"
                    >
                      {specs.map((spec: string) => (
                        <li key={spec} className="text-slate-800 font-medium">
                          {spec}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-8" data-animate="fade-up" data-delay="300">
                    <Link
                      href={`/contacto?servicio=${service.slug}`}
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
