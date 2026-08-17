import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCliente, getClientes, getTrabajos } from '@/lib/content'
import ClienteTrabajos from './ClienteTrabajos'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const clientes = await getClientes()
    return clientes.filter((c) => c.tiene_blog).map((c) => ({ slug: c.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const cliente = await getCliente(slug)
    if (!cliente) return { title: 'Cliente no encontrado' }
    return {
      title: cliente.name,
      description: cliente.bio || `${cliente.name} — cliente de Grúas InGlobal S.R.L.`,
    }
  } catch {
    return { title: 'Cliente' }
  }
}

export default async function ClienteDetailPage({ params }: Props) {
  const { slug } = await params
  const cliente = await getCliente(slug)

  if (!cliente || !cliente.tiene_blog) notFound()

  const trabajos = await getTrabajos(cliente.id)
  const historia = (cliente.content || '').split('\n\n').filter(Boolean)

  return (
    <main className="bg-white">
      {/* Page Header */}
      <section className="pt-40 pb-20 bg-zinc-50 border-b border-zinc-100">
        <div className="container-igb">
          <span
            className="text-igb-yellow-dark text-xs font-bold tracking-[0.2em] uppercase mb-4 block"
            data-animate="fade-up"
          >
            Nuestros Clientes
          </span>
          <h1
            className="text-5xl md:text-6xl font-headline font-extrabold text-zinc-900 tracking-tight"
            data-animate="blur-up"
            data-delay="100"
          >
            {cliente.name}
          </h1>
          {cliente.bio && (
            <p
              className="text-xl text-zinc-500 max-w-2xl leading-relaxed mt-6"
              data-animate="fade-up"
              data-delay="200"
            >
              {cliente.bio}
            </p>
          )}
        </div>
      </section>

      {/* Historia con el cliente */}
      {historia.length > 0 && (
        <section className="py-24">
          <div className="container-igb max-w-3xl">
            <span className="label-tag">Nuestra historia</span>
            <div className="space-y-6">
              {historia.map((p, i) => (
                <p key={i} className="text-zinc-600 text-lg leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trabajos */}
      {trabajos.length > 0 && (
        <section className="py-24">
          <div className="container-igb max-w-5xl">
            <span className="label-tag">Trabajos realizados</span>
            <h2 className="heading-display mb-10">Proyectos con {cliente.name}</h2>

            <ClienteTrabajos clienteSlug={cliente.slug} trabajos={trabajos} />

            <div className="mt-16 pt-10 border-t border-zinc-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <Link
                href="/clientes"
                className="text-igb-yellow-dark font-bold font-headline text-sm flex items-center gap-2 hover:gap-3 transition-all"
              >
                ← Volver a Clientes
              </Link>
              <Link href="/contacto" className="btn-primary">
                Trabajar con InGlobal
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
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
