import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getGaleriaItem } from '@/lib/content'
import { updateGaleriaItem, deleteGaleriaItem } from '@/app/actions/galeria'
import PageHeader from '@/components/dashboard/PageHeader'
import GaleriaForm from '../GaleriaForm'
import DeleteButton from '@/components/dashboard/DeleteButton'
import { ArrowLeft, ExternalLink } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function GaleriaEditPage({ params }: Props) {
  const { id } = await params
  const item = await getGaleriaItem(id)

  if (!item) notFound()

  async function handleDelete(formData: FormData) {
    'use server'
    await deleteGaleriaItem(undefined, formData)
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard/galeria"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={14} /> Volver a Galería
        </Link>
        <Link
          href="/galeria"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          <ExternalLink size={12} /> Ver en sitio
        </Link>
      </div>

      <PageHeader
        title="Editar imagen"
        description={item.alt}
        actions={
          <form action={handleDelete}>
            <input type="hidden" name="id" value={item.id} />
            <DeleteButton confirmMessage="¿Eliminar esta imagen de la galería? Esta acción no se puede deshacer." />
          </form>
        }
      />

      <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
        <GaleriaForm item={item} entityId={item.id} action={updateGaleriaItem} />
      </div>
    </div>
  )
}
