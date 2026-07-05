import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMontaje } from '@/lib/content'
import { updateMontaje, deleteMontaje } from '@/app/actions/montajes'
import PageHeader from '@/components/dashboard/PageHeader'
import MontajeForm from '../MontajeForm'
import DeleteButton from '@/components/dashboard/DeleteButton'
import { ArrowLeft, ExternalLink } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function MontajeEditPage({ params }: Props) {
  const { id } = await params
  const montaje = await getMontaje(id, { includeUnpublished: true })

  if (!montaje) notFound()

  async function handleDelete(formData: FormData) {
    'use server'
    await deleteMontaje(undefined, formData)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard/montajes"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={14} /> Volver a Montajes
        </Link>
        <Link
          href={`/montajes/${montaje.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          <ExternalLink size={12} /> Ver en sitio
        </Link>
      </div>

      <PageHeader
        title={`Editar: ${montaje.title}`}
        description={`/montajes/${montaje.slug}`}
        actions={
          <form action={handleDelete}>
            <input type="hidden" name="id" value={montaje.id} />
            <DeleteButton confirmMessage={`¿Eliminar "${montaje.title}"? Esta acción no se puede deshacer.`} />
          </form>
        }
      />

      <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
        <MontajeForm montaje={montaje} entityId={montaje.id} action={updateMontaje} />
      </div>
    </div>
  )
}
