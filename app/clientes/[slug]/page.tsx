import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCliente, getClientes } from '@/lib/content'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const clientes = await getClientes()
    return clientes.map((c) => ({ slug: c.slug }))
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

  if (!cliente) notFound()

  const paragraphs = (cliente.content || cliente.bio || '')
    .split('\n\n')
    .filter(Boolean)

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
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            {cliente.logo && (
              <div
                className="w-32 h-20 flex items-center flex-shrink-0"
                data-animate="fade-up"
              >
                <Image
                  src={cliente.logo}
                  alt={`Logo ${cliente.name}`}
                  width={160}
                  height={80}
                  sizes="160px"
                  className="object-contain max-h-20 w-auto"
                />
              </div>
            )}
            <h1
              className="text-5xl md:text-6xl font-headline font-extrabold text-zinc-900 tracking-tight"
              data-animate="fade-up"
              data-delay="100"
            >
              {cliente.name}
            </h1>
          </div>
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

      {/* Content */}
      {paragraphs.length > 0 && (
        <section className="py-24">
          <div className="container-igb max-w-3xl">
            <div className="space-y-6">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-zinc-600 text-lg leading-relaxed">
                  {p}
                </p>
              ))}
            </div>

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
