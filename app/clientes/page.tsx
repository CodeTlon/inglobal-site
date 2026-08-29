import type { Metadata } from 'next'
import Link from 'next/link'
import { getClientes, getSiteSettings } from '@/lib/content'
import ClientesGrid from './ClientesGrid'
import ClientesLogoMarquee from '@/components/ClientesLogoMarquee'

export const metadata: Metadata = {
  title: 'Clientes',
  description: 'Empresas que confían en Grúas InGlobal S.R.L. para sus trabajos de elevación, montaje y transporte pesado en Argentina.',
}

export default async function ClientesPage() {
  const [clientes, settings, cta] = await Promise.all([
    getClientes(),
    getSiteSettings('clientes_destacados'),
    getSiteSettings('clientes_cta'),
  ])

  const conBlog = clientes.filter((c) => c.tiene_blog)
  const sinBlog = clientes.filter((c) => !c.tiene_blog)

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

      {/* Casos de éxito — clickeable, lleva a historia + trabajos del cliente */}
      {conBlog.length > 0 && (
        <section className="section-pad bg-white">
          <div className="container-igb">
            <div className="text-center mb-12" data-animate="fade-up">
              <span className="label-tag">Casos de éxito</span>
              <h2 className="heading-display">Clientes con historia propia</h2>
            </div>
            <ClientesGrid clientes={conBlog} />
          </div>
        </section>
      )}

      {/* Resto de clientes — solo logo, carrusel automático, sin click */}
      {sinBlog.length > 0 && (
        <section className="pt-24 lg:pt-32 pb-16 lg:pb-20 bg-zinc-50 border-y border-zinc-100">
          <div className="container-igb">
            <div className="text-center mb-12" data-animate="fade-up">
              <span className="label-tag">Otras alianzas</span>
              <h2 className="heading-display">Otras empresas que nos eligen</h2>
            </div>
          </div>
          <ClientesLogoMarquee clientes={sinBlog} />
          <p className="text-center text-zinc-500 text-sm font-medium mt-10" data-animate="fade-up">
            {clientes.length} empresas que ya eligieron Grúas InGlobal
          </p>
        </section>
      )}

      {/* Final CTA — fondo navy a propósito, para que no se lea como una
          continuación más del gris de arriba (antes zinc-100 sobre
          zinc-50 casi no se distinguían, y encima había una franja blanca
          suelta en el medio con el conteo de empresas). */}
      <section className="py-24 bg-igb-navy">
        <div className="container-igb text-center">
          <h2
            className="text-3xl md:text-4xl font-headline font-bold text-white tracking-tight mb-6"
            data-animate="fade-up"
          >
            {(cta.heading as string) || '¿Querés trabajar con nosotros?'}
          </h2>
          <p
            className="text-slate-300 text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
            data-animate="fade-up"
            data-delay="150"
          >
            {(cta.subheading as string) || 'Somos una PyME con una gran fortaleza humana donde construimos relaciones comerciales excelentes y duraderas.'}
          </p>
          <Link
            href="/contacto"
            className="btn-primary inline-block px-12 py-4 text-lg shadow-lg shadow-igb-yellow/20 transition-all hover:-translate-y-1"
            data-animate="scale"
            data-delay="250"
          >
            {(cta.button as string) || 'Contactar ahora'}
          </Link>
        </div>
      </section>
    </main>
  )
}
