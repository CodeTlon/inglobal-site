import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServicios } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import ServicioForm from '../ServicioForm'
import { updateServicio, deleteServicio } from '@/app/actions/servicios'
import DeleteButton from '@/components/dashboard/DeleteButton'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ServicioEditPage({ params }: Props) {
  const { id } = await params
  const servicios = await getServicios({ includeUnpublished: true })
  const servicio = servicios.find((s) => s.slug === id)

  if (!servicio) notFound()

  async function handleDelete(formData: FormData) {
    'use server'
    await deleteServicio(undefined, formData)
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link
          href="/dashboard/servicios"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={14} /> Volver a Servicios
        </Link>
      </div>

      <PageHeader
        title={`Editar: ${servicio.title}`}
        description={`Slug: ${servicio.slug}`}
        actions={
          <form action={handleDelete}>
            <input type="hidden" name="id" value={servicio.id} />
            <DeleteButton confirmMessage={`¿Eliminar "${servicio.title}"? Esta acción no se puede deshacer.`} />
          </form>
        }
      />

      <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
        <ServicioForm servicio={servicio} entityId={servicio.id} action={updateServicio} />
      </div>
    </div>
  )
}
