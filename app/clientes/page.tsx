import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getClientes, getSiteSettings } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Clientes',
  description: 'Empresas que confían en Grúas InGlobal S.R.L. para sus trabajos de elevación, montaje y transporte pesado en Argentina.',
}

export default async function ClientesPage() {
  const [clientes, settings] = await Promise.all([
    getClientes(),
    getSiteSettings('clientes_destacados'),
  ])

  const label = (settings.label as string) || 'Nuestras Alianzas'
  const heading = (settings.heading as string) || 'Nuestros Clientes'
  const subheading =
    (settings.subheading as string) ||
    'Empresas líderes de Argentina que nos eligen por nuestro compromiso y resultados. Su confianza es nuestro mayor aval.'

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
            className="text-5xl md:text-6xl font-headline font-extrabold text-zinc-900 tracking-tight mb-6 leading-tight"
            data-animate="blur-up"
            data-delay="100"
          >
            {heading}
          </h1>
          <p
            className="text-xl text-zinc-500 max-w-2xl leading-relaxed"
            data-animate="fade-up"
            data-delay="200"
          >
            {subheading}
          </p>
        </div>
      </section>

      {/* Logo grid — flex-wrap auto-centers any orphan row */}
      <section className="section-pad bg-white">
        <div className="container-igb">
          <div className="flex flex-wrap justify-center gap-6">
            {clientes.map((cliente) => (
              <Link
                key={cliente.slug}
                href={`/clientes/${cliente.slug}`}
                className="w-[calc(50%-0.75rem)] sm:w-[calc(33.333%-1rem)] md:w-[calc(25%-1.125rem)] lg:w-[calc(20%-1.2rem)] bg-white rounded-xl p-6 flex items-center justify-center shadow-sm border border-zinc-100 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:-translate-y-1 transition-all duration-300 aspect-[3/2]"
                data-animate="scale"
              >
                <Image
                  src={cliente.logo}
                  alt={`Logo ${cliente.name}`}
                  width={140}
                  height={70}
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 18vw"
                  quality={70}
                  loading="lazy"
                  className="object-contain max-h-12 w-auto"
                />
              </Link>
            ))}
          </div>

          <div className="mt-16 text-center" data-animate="fade-up" data-delay="200">
            <p className="text-zinc-500 text-sm font-medium">
              {clientes.length} empresas que ya eligieron Grúas InGlobal
            </p>
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
            ¿Querés trabajar con nosotros?
          </h2>
          <p
            className="text-zinc-600 text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
            data-animate="fade-up"
            data-delay="150"
          >
            Somos una PyME con una gran fortaleza humana donde construimos relaciones comerciales excelentes y duraderas.
          </p>
          <Link
            href="/contacto"
            className="btn-primary inline-block px-12 py-4 text-lg shadow-lg shadow-igb-yellow/20 transition-all hover:-translate-y-1"
            data-animate="scale"
            data-delay="250"
          >
            Contactar ahora
          </Link>
        </div>
      </section>
    </main>
  )
}
