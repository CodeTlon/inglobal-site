import type { Metadata } from 'next'
import Image from 'next/image'
import Picture from '@/components/Picture'
import { getSiteSettings } from '@/lib/content'
import { CheckCircle, Zap, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Quiénes Somos',
  description: 'Somos Inglobal, empresa líder en movimientos especiales pesados y montajes industriales con más de 40 años de trayectoria en Argentina.',
}

const defaultFeatures = [
  { icon: CheckCircle, text: 'Operadores y equipos certificados en todo el país' },
  { icon: Zap, text: 'Rapidez, seguridad, costo y calidad como diferencial' },
  { icon: Users, text: 'Nuestros clientes nos eligen una y otra vez' },
]

export default async function QuienesSomosPage() {
  const settings = await getSiteSettings('quienes_somos')

  const label = (settings.label as string) || 'Quiénes Somos'
  const heading = (settings.heading as string) || 'Grúas InGlobal S.R.L.'
  const companyName = (settings.company_name as string) || 'Inglobal'
  const description1 =
    (settings.description1 as string) ||
    `Somos ${companyName}, una empresa líder en movimientos especiales pesados y montajes industriales. Como continuadores de una empresa familiar con más de 40 años de trayectoria, combinamos experiencia técnica con un compromiso inquebrantable hacia nuestros clientes.`
  const description2 =
    (settings.description2 as string) ||
    'Ofrecemos el alquiler de grúas, hidrogrúas, transporte y maquinaria pesada en todo el país. Nos respaldan operadores y equipos certificados, garantizando que cada operación cumpla con los más altos estándares de seguridad y eficiencia.'
  const imageUrl = (settings.image as string) || ''

  const features = Array.isArray(settings.features)
    ? (settings.features as { icon?: string; text: string }[]).map((f, i) => ({
        icon: defaultFeatures[i]?.icon ?? CheckCircle,
        text: f.text,
      }))
    : defaultFeatures

  return (
    <main className="bg-white">
      {/* Page Header */}
      <section className="pt-40 pb-20 bg-zinc-50 border-b border-zinc-100">
        <div className="container-igb">
          <span
            className="text-igb-yellow-dark text-xs font-bold tracking-[0.2em] uppercase mb-4 block"
            data-animate="fade-up"
          >
            {label}
          </span>
          <h1
            className="text-5xl md:text-6xl font-headline font-extrabold text-zinc-900 tracking-tight mb-6"
            data-animate="fade-up"
            data-delay="100"
          >
            {heading}
          </h1>
          <p
            className="text-xl text-zinc-500 max-w-2xl leading-relaxed"
            data-animate="fade-up"
            data-delay="200"
          >
            Más de 40 años acompañando a la industria argentina con soluciones de elevación y logística pesada.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-pad bg-igb-surface">
        <div className="container-igb">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="relative" data-animate="from-right">
              {imageUrl && imageUrl.startsWith('http') ? (
                <Image
                  src={imageUrl}
                  alt="Equipo de Grúas InGlobal trabajando en altura"
                  width={620}
                  height={480}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="rounded-xl object-cover w-full aspect-[4/3]"
                />
              ) : (
                <Picture
                  src={imageUrl || 'igb-2'}
                  alt="Equipo de Grúas InGlobal trabajando en altura"
                  width={620}
                  height={480}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="rounded-xl object-cover w-full aspect-[4/3]"
                />
              )}
            </div>

            {/* Text */}
            <div>
              <span className="label-tag" data-animate="fade-up">
                Nuestra Historia
              </span>
              <h2
                className="heading-display mb-6"
                data-animate="fade-up"
                data-delay="100"
              >
                {companyName}{' '}
                <span className="text-igb-yellow-dark">S.R.L.</span>
              </h2>

              <div
                className="space-y-4 text-igb-secondary leading-relaxed"
                data-animate="fade-up"
                data-delay="200"
              >
                <p>
                  {description1}
                </p>
                <p>
                  {description2}
                </p>
              </div>

              <ul
                className="mt-8 space-y-4"
                data-animate="fade-up"
                data-delay="300"
              >
                {features.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-igb-yellow-dark flex-shrink-0" />
                    <span className="text-igb-on-surface/80 text-sm">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="section-pad bg-igb-surface-low">
        <div className="container-igb">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              { number: '40+', label: 'Años de trayectoria' },
              { number: '200t', label: 'Capacidad máxima de izaje' },
              { number: '100m', label: 'Altura máxima de operación' },
            ].map((s) => (
              <div key={s.label} data-animate="fade-up">
                <p className="text-5xl font-headline font-extrabold text-zinc-900 tracking-tight">
                  {s.number}
                </p>
                <p className="text-sm font-bold text-igb-secondary uppercase tracking-wider mt-3">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
