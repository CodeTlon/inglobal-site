import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEventoAgendaById, getGruas, getEmpresasAgenda, getOperarios } from '@/lib/agenda'
import { updateEvento, deleteEvento } from '@/app/actions/agenda'
import PageHeader from '@/components/dashboard/PageHeader'
import EventoForm from '../EventoForm'
import DeleteButton from '@/components/dashboard/DeleteButton'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EventoEditPage({ params }: Props) {
  const { id } = await params
  const [evento, gruas, empresas, operarios] = await Promise.all([
    getEventoAgendaById(id),
    getGruas({ includeInactive: true }),
    getEmpresasAgenda({ includeInactive: true }),
    getOperarios({ includeInactive: true }),
  ])

  if (!evento) notFound()

  async function handleDelete(formData: FormData) {
    'use server'
    await deleteEvento(undefined, formData)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/dashboard/agenda"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={14} /> Volver a Agenda
        </Link>
      </div>

      <PageHeader
        title={`Editar evento — ${evento.fecha}`}
        description={`${evento.grua?.nombre ?? ''} · ${evento.empresa?.nombre ?? ''}`}
        actions={
          <form action={handleDelete}>
            <input type="hidden" name="id" value={evento.id} />
            <DeleteButton confirmMessage="¿Eliminar este evento de la agenda? Esta acción no se puede deshacer." />
          </form>
        }
      />

      <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
        <EventoForm evento={evento} gruas={gruas} empresas={empresas} operarios={operarios} action={updateEvento} />
      </div>
    </div>
  )
}
