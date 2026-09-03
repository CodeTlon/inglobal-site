import type { Metadata } from 'next'
import Image from 'next/image'
import Picture from '@/components/Picture'
import Link from 'next/link'
import { getServicios, getSiteSettings } from '@/lib/content'
import { JsonLd } from '@/components/seo/JsonLd'
import TLDRBox from '@/components/TLDRBox'
import { SITE_URL } from '@/lib/site'
import {
  ArrowUpToLine,
  HardHat,
  Move,
  Truck,
  type LucideIcon,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Servicios',
  description:
    'Grúas telescópicas, hidrogrúas, movimientos pesados y traslados con carretones en Córdoba y toda Argentina. Cotización según carga, altura y plazos — respuesta con asesoramiento técnico.',
}

const ICON_MAP: Record<string, LucideIcon> = {
  ArrowUpToLine,
  HardHat,
  Move,
  Truck,
}

const FAQ_ITEMS = [
  {
    q: '¿Cómo se cotiza un servicio de grúa o montaje industrial?',
    a: 'La cotización depende del peso y las dimensiones de la carga, la altura o el alcance requerido, el tipo de terreno y los plazos de la operación. Con esos datos armamos un presupuesto técnico a medida — no manejamos tarifas fijas por hora sin evaluar el proyecto primero.',
  },
  {
    q: '¿Qué información necesitan para armar el presupuesto?',
    a: 'Peso y dimensiones de la carga, ubicación y accesos al sitio, altura o distancia de izaje, y la fecha estimada del trabajo. Cuanta más precisión tengamos, más ajustado sale el presupuesto — si todavía no tenés todos los datos, igual podemos avanzar con una primera estimación.',
  },
  {
    q: '¿Cuánto tiempo lleva coordinar un montaje o izaje?',
    a: 'Para operaciones estándar, entre 24 y 72 horas desde que confirmamos el presupuesto hasta que el equipo está en sitio. Montajes de mayor complejidad (grandes alturas, cargas especiales, múltiples grúas) requieren una etapa previa de planificación técnica más extensa.',
  },
  {
    q: '¿Los operadores y equipos están certificados?',
    a: 'Sí. Todos nuestros operadores tienen certificación vigente y los equipos pasan mantenimiento e inspección periódica, en línea con las normas de seguridad para trabajo en altura y movimiento de cargas pesadas en Argentina.',
  },
  {
    q: '¿Trabajan en toda Argentina o solo en Córdoba?',
    a: 'Nuestra base operativa está en Córdoba, pero cubrimos traslados y montajes en todo el país según el proyecto. Contanos la ubicación al pedir el presupuesto para calcular los costos de traslado del equipo.',
  },
  {
    q: '¿Qué pasa si el alcance del proyecto cambia sobre la marcha?',
    a: 'Es habitual en obra. Reevaluamos el presupuesto y los tiempos apenas surge un cambio de alcance (otro peso, otra altura, otro acceso) y te lo confirmamos antes de seguir — sin sorpresas en la facturación final.',
  },
]

export default async function ServiciosPage() {
  const services = await getServicios()
  const s = await getSiteSettings('servicios_header')

  return (
    <main className="bg-white">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            ...services.map((service) => ({
              '@type': 'Service',
              serviceType: service.title,
              name: service.title,
              description: service.desc || service.excerpt,
              provider: {
                '@type': 'LocalBusiness',
                name: 'Grúas InGlobal S.R.L.',
                url: SITE_URL,
              },
              areaServed: 'Argentina',
              url: `${SITE_URL}/servicios#${service.slug}`,
            })),
            {
              '@type': 'FAQPage',
              mainEntity: FAQ_ITEMS.map((item) => ({
                '@type': 'Question',
                name: item.q,
                acceptedAnswer: { '@type': 'Answer', text: item.a },
              })),
            },
          ],
        }}
      />

      {/* Page Header */}
      <section className="pt-40 pb-20 bg-zinc-50 border-b border-zinc-100">
        <div className="container-igb">
          <span
            className="text-igb-yellow-dark text-xs font-bold tracking-[0.2em] uppercase mb-4 block"
            data-animate="fade-up"
          >
            {(s.label as string) || 'Nuestras Soluciones'}
          </span>
          <h1
            className="text-5xl md:text-6xl font-headline font-extrabold text-zinc-900 tracking-tight mb-6"
            data-animate="blur-up"
            data-delay="100"
          >
            {(s.heading as string) || 'Nuestros Servicios'}
          </h1>
          <p
            className="text-xl text-zinc-500 max-w-2xl leading-relaxed mb-8"
            data-animate="fade-up"
            data-delay="200"
          >
            {(s.subheading as string) ||
              'Alquiler de grúas telescópicas, hidrogrúas, movimientos pesados y traslados con carretones en Córdoba y toda Argentina — equipos certificados y operadores expertos para cada tipo de carga.'}
          </p>

          <div className="max-w-2xl" data-animate="fade-up" data-delay="250">
            <TLDRBox
              heading="Nuestros servicios en resumen"
              items={services.map((service) => service.excerpt || service.title)}
            />
            <Link
              href="/contacto"
              className="btn-primary transition-all hover:-translate-y-0.5"
            >
              {(s.cta_button as string) || 'Solicitar Presupuesto'}
            </Link>
          </div>
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

      {/* FAQ */}
      <section className="py-24 bg-zinc-50 border-t border-zinc-100" id="preguntas-frecuentes">
        <div className="container-igb max-w-3xl">
          <div className="mb-14 text-center" data-animate="fade-up">
            <span className="label-tag">Dudas frecuentes</span>
            <h2 className="heading-display">Preguntas sobre cotización y montajes</h2>
          </div>

          <div className="space-y-8">
            {FAQ_ITEMS.map((item) => (
              <div key={item.q} className="border-b border-zinc-200 pb-8" data-animate="fade-up">
                <h3 className="text-xl font-headline font-bold text-zinc-900 mb-3">{item.q}</h3>
                <p className="text-zinc-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-4" data-animate="fade-up" data-delay="150">
            <Link href="/montajes" className="btn-outline transition-all hover:-translate-y-0.5">
              Ver casos de éxito
            </Link>
            <Link href="/contacto" className="btn-primary transition-all hover:-translate-y-0.5">
              Consultar mi proyecto
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-zinc-100">
        <div className="container-igb flex flex-col items-center text-center gap-10 lg:flex-row lg:justify-between lg:text-left">
          <div className="max-w-xl" data-animate="fade-up">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4 text-zinc-900 tracking-tight">
              {(s.cta_heading as string) || '¿Listo para comenzar su proyecto?'}
            </h2>
            <p className="text-zinc-600 text-lg">
              {(s.cta_subheading as string) || 'Asesoramiento técnico personalizado para cada necesidad de izaje.'}
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
