import type { Metadata } from 'next'
import Link from 'next/link'
import { getMontajes, getSiteSettings } from '@/lib/content'
import MontajesGrid from './MontajesGrid'

export const metadata: Metadata = {
  title: 'Montajes Industriales',
  description: 'Casos de estudio y proyectos de montajes industriales realizados por Grúas InGlobal S.R.L.',
}

export default async function MontajesPage() {
  const montajes = await getMontajes()
  const s = await getSiteSettings('montajes_header')

  return (
    <main className="bg-white">
      {/* Header */}
      <section className="pt-40 pb-20 bg-zinc-50 border-b border-zinc-100">
        <div className="container-igb">
          <span
            className="text-igb-yellow-dark text-xs font-bold tracking-[0.2em] uppercase mb-4 block"
            data-animate="fade-up"
          >
            {(s.label as string) || 'Portafolio de Proyectos'}
          </span>
          <h1
            className="text-5xl md:text-6xl font-headline font-extrabold text-zinc-900 tracking-tight mb-6"
            data-animate="blur-up"
            data-delay="100"
          >
            {(s.heading as string) || 'Casos de Éxito'}
          </h1>
          <p
            className="text-xl text-zinc-500 max-w-2xl leading-relaxed"
            data-animate="fade-up"
            data-delay="200"
          >
            {(s.subheading as string) || 'Ingeniería aplicada a desafíos complejos. Cada proyecto es un testimonio de nuestra precisión técnica y compromiso con la seguridad.'}
          </p>
        </div>
      </section>

      {/* Montajes Grid */}
      <section className="py-24">
        <div className="container-igb">
          <MontajesGrid montajes={montajes} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-zinc-100">
        <div className="container-igb text-center">
          <h2
            className="text-3xl md:text-4xl font-headline font-bold text-zinc-900 tracking-tight mb-6"
            data-animate="fade-up"
          >
            {(s.cta_heading as string) || '¿Tu proyecto es el próximo desafío?'}
          </h2>
          <p
            className="text-zinc-600 text-lg max-w-xl mx-auto mb-10"
            data-animate="fade-up"
            data-delay="150"
          >
            {(s.cta_subheading as string) || 'Contactanos para recibir asesoramiento técnico especializado y presupuesto a medida.'}
          </p>
          <Link
            href="/contacto"
            className="btn-primary inline-block px-12 py-4 text-lg shadow-lg shadow-igb-yellow/20 transition-all hover:-translate-y-1"
            data-animate="scale"
            data-delay="250"
          >
            {(s.cta_button as string) || 'Consultanos ahora'}
          </Link>
        </div>
      </section>
    </main>
  )
}
