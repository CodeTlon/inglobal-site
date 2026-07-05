import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCliente, getTrabajos } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import { ChevronRight, Plus, ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ClienteTrabajosDashboardPage({ params }: Props) {
  const { id } = await params
  const cliente = await getCliente(id, { includeUnpublished: true })
  if (!cliente) notFound()

  const trabajos = await getTrabajos(cliente.id, { includeUnpublished: true })

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link
          href={`/dashboard/clientes/${cliente.slug}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={14} /> Volver a {cliente.name}
        </Link>
      </div>

      <PageHeader
        title={`Trabajos — ${cliente.name}`}
        description={`${trabajos.length} trabajo(s) cargado(s).`}
        actions={
          <Link
            href={`/dashboard/clientes/${cliente.slug}/trabajos/nuevo`}
            className="inline-flex items-center gap-2 bg-igb-yellow text-igb-on-yellow px-4 py-2.5 rounded-md font-headline font-bold text-sm hover:brightness-95 transition-all"
          >
            <Plus size={16} /> Nuevo trabajo
          </Link>
        }
      />

      <div className="space-y-3">
        {trabajos.map((t) => (
          <Link
            key={t.slug}
            href={`/dashboard/clientes/${cliente.slug}/trabajos/${t.id}`}
            className="flex items-center gap-4 bg-white rounded-xl p-4 border border-zinc-200 shadow-sm hover:shadow-igb hover:border-igb-yellow/40 transition-all group"
          >
            <div className="flex-1 min-w-0">
              <p className="font-headline font-bold text-zinc-900 text-sm">{t.title}</p>
              {t.excerpt && <p className="text-zinc-400 text-xs mt-1 line-clamp-1">{t.excerpt}</p>}
            </div>

            <ChevronRight
              size={16}
              className="text-zinc-300 group-hover:text-igb-yellow-dark group-hover:translate-x-1 transition-all flex-shrink-0"
            />
          </Link>
        ))}

        {trabajos.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
            <p className="text-zinc-400 text-sm">Este cliente todavía no tiene trabajos cargados.</p>
            <Link
              href={`/dashboard/clientes/${cliente.slug}/trabajos/nuevo`}
              className="inline-flex items-center gap-2 mt-4 text-igb-yellow-dark font-bold text-sm hover:underline"
            >
              <Plus size={14} /> Crear el primero
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
