import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCliente } from '@/lib/content'
import { updateCliente, deleteCliente } from '@/app/actions/clientes'
import PageHeader from '@/components/dashboard/PageHeader'
import ClienteForm from '../ClienteForm'
import DeleteButton from '@/components/dashboard/DeleteButton'
import { ArrowLeft, ExternalLink, Newspaper } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ClienteEditPage({ params }: Props) {
  const { id } = await params
  const cliente = await getCliente(id)

  if (!cliente) notFound()

  async function handleDelete(formData: FormData) {
    'use server'
    await deleteCliente(undefined, formData)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard/clientes"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={14} /> Volver a Clientes
        </Link>
        <Link
          href={`/clientes/${cliente.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          <ExternalLink size={12} /> Ver en sitio
        </Link>
      </div>

      <PageHeader
        title={`Editar: ${cliente.name}`}
        description={`/clientes/${cliente.slug}`}
        actions={
          <form action={handleDelete}>
            <input type="hidden" name="id" value={cliente.id} />
            <DeleteButton confirmMessage={`¿Eliminar "${cliente.name}"? Esta acción no se puede deshacer.`} />
          </form>
        }
      />

      <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm mb-6">
        <ClienteForm cliente={cliente} entityId={cliente.id} action={updateCliente} />
      </div>

      <Link
        href={`/dashboard/clientes/${cliente.slug}/trabajos`}
        className="flex items-center gap-3 bg-white rounded-xl p-4 border border-zinc-200 shadow-sm hover:shadow-igb hover:border-igb-yellow/40 transition-all"
      >
        <Newspaper size={18} className="text-igb-yellow-dark flex-shrink-0" />
        <div>
          <p className="font-headline font-bold text-zinc-900 text-sm">Gestionar trabajos</p>
          <p className="text-zinc-400 text-xs">Trabajos y proyectos realizados con este cliente.</p>
        </div>
      </Link>
    </div>
  )
}
