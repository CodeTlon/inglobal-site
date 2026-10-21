import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEventoAgendaById, getGruas, getEmpresasAgenda, getOperarios } from '@/lib/agenda'
import { updateEvento, deleteEvento } from '@/app/actions/agenda'
import PageHeader from '@/components/dashboard/PageHeader'
import EventoForm from '../EventoForm'
import DeleteButton from '@/components/dashboard/DeleteButton'
import EventoEstadoActions from '@/components/agenda/EventoEstadoActions'
import type { EstadoEvento } from '@/lib/validations/agenda'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string }>
}

export default async function EventoEditPage({ params, searchParams }: Props) {
  const { id } = await params
  const { from } = await searchParams
  const [evento, gruas, empresas, operarios] = await Promise.all([
    getEventoAgendaById(id),
    getGruas({ includeInactive: true }),
    getEmpresasAgenda({ includeInactive: true }),
    getOperarios({ includeInactive: true }),
  ])

  if (!evento) notFound()

  const bloqueado = evento.estado === 'finalizado' || evento.estado === 'cancelado'
  const puedeEliminar = evento.estado !== 'en_curso' && evento.estado !== 'finalizado'

  async function handleDelete(formData: FormData) {
    'use server'
    await deleteEvento(undefined, formData)
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link
          href={from || '/dashboard/agenda'}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={14} /> Volver
        </Link>
      </div>

      <PageHeader
        title={`Editar evento — ${evento.fecha}`}
        description={`${evento.empresa?.nombre ?? ''} · ${evento.grua?.nombre ?? ''}`}
        actions={
          puedeEliminar ? (
            <form action={handleDelete}>
              <input type="hidden" name="id" value={evento.id} />
              <input type="hidden" name="from" value={from ?? ''} />
              <DeleteButton confirmMessage="¿Eliminar este evento de la agenda? Esta acción no se puede deshacer." />
            </form>
          ) : undefined
        }
      />

      {bloqueado && (
        <p className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600" role="status">
          Un evento {evento.estado} no puede editarse ni eliminarse: queda como historial.
        </p>
      )}
      {evento.estado === 'en_curso' && (
        <p className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800" role="status">
          El evento está en curso: solo se puede cambiar el estado (finalizar o cancelar). No se puede eliminar.
        </p>
      )}
      {!bloqueado && (
        <div className="mb-4">
          <EventoEstadoActions eventoId={evento.id} estado={evento.estado as EstadoEvento} />
        </div>
      )}

      <div className={`bg-white rounded-xl p-6 border border-zinc-200 shadow-xs ${bloqueado ? 'opacity-60' : ''}`}>
        <EventoForm evento={evento} gruas={gruas} empresas={empresas} operarios={operarios} action={updateEvento} from={from} />
      </div>
    </div>
  )
}
