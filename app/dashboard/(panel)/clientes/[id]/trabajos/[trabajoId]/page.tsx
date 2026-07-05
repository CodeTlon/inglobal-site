import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCliente, getTrabajoById } from '@/lib/content'
import { updateTrabajo, deleteTrabajo } from '@/app/actions/trabajos'
import PageHeader from '@/components/dashboard/PageHeader'
import TrabajoForm from '../TrabajoForm'
import DeleteButton from '@/components/dashboard/DeleteButton'
import { ArrowLeft, ExternalLink } from 'lucide-react'

interface Props {
  params: Promise<{ id: string; trabajoId: string }>
}

export default async function TrabajoEditPage({ params }: Props) {
  const { id, trabajoId } = await params
  const cliente = await getCliente(id, { includeUnpublished: true })
  if (!cliente) notFound()

  const trabajo = await getTrabajoById(trabajoId)
  if (!trabajo || trabajo.cliente_id !== cliente.id) notFound()

  async function handleDelete(formData: FormData) {
    'use server'
    await deleteTrabajo(undefined, formData)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/dashboard/clientes/${cliente.slug}/trabajos`}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={14} /> Volver a Trabajos
        </Link>
        <Link
          href={`/clientes/${cliente.slug}/${trabajo.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          <ExternalLink size={12} /> Ver en sitio
        </Link>
      </div>

      <PageHeader
        title={`Editar: ${trabajo.title}`}
        description={`/clientes/${cliente.slug}/${trabajo.slug}`}
        actions={
          <form action={handleDelete}>
            <input type="hidden" name="id" value={trabajo.id} />
            <DeleteButton confirmMessage={`¿Eliminar "${trabajo.title}"? Esta acción no se puede deshacer.`} />
          </form>
        }
      />

      <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
        <TrabajoForm clienteId={cliente.id} trabajo={trabajo} entityId={trabajo.id} action={updateTrabajo} />
      </div>
    </div>
  )
}
