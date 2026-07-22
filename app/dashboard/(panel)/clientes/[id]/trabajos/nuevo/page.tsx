import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCliente } from '@/lib/content'
import { createTrabajo } from '@/app/actions/trabajos'
import PageHeader from '@/components/dashboard/PageHeader'
import TrabajoForm from '../TrabajoForm'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function NuevoTrabajoPage({ params }: Props) {
  const { id } = await params
  const cliente = await getCliente(id, { includeUnpublished: true })
  if (!cliente) notFound()

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link
          href={`/dashboard/clientes/${cliente.slug}/trabajos`}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={14} /> Volver a Trabajos
        </Link>
      </div>

      <PageHeader title={`Nuevo trabajo — ${cliente.name}`} description="Completá los campos para publicar un nuevo trabajo." />

      <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
        <TrabajoForm clienteId={cliente.id} action={createTrabajo} />
      </div>
    </div>
  )
}
