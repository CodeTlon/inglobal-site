import Link from 'next/link'
import { getEventosAgenda } from '@/lib/agenda'
import PageHeader from '@/components/dashboard/PageHeader'
import AgendaTvQrLink from './AgendaTvQrLink'
import { ChevronRight, Plus, Settings2, MapPin, Users } from 'lucide-react'

const ESTADO_STYLES: Record<string, string> = {
  programado: 'bg-igb-yellow/15 text-igb-yellow-dark',
  en_curso: 'bg-blue-50 text-blue-600',
  finalizado: 'bg-zinc-100 text-zinc-500',
  cancelado: 'bg-red-50 text-red-500',
}

export default async function AgendaDashboardPage() {
  const eventos = await getEventosAgenda({ desde: new Date().toISOString().slice(0, 10) })

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Agenda de Grúas"
        description={`${eventos.length} eventos programados desde hoy.`}
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/agenda/catalogos"
              className="inline-flex items-center gap-2 bg-white text-zinc-600 border border-zinc-200 px-4 py-2.5 rounded-md font-headline font-bold text-sm hover:border-igb-yellow-dark/40 transition-all"
            >
              <Settings2 size={16} /> Catálogos
            </Link>
            <Link
              href="/dashboard/agenda/nuevo"
              className="inline-flex items-center gap-2 bg-igb-yellow text-igb-on-yellow px-4 py-2.5 rounded-md font-headline font-bold text-sm hover:brightness-95 transition-all"
            >
              <Plus size={16} /> Nuevo evento
            </Link>
          </div>
        }
      />

      <div className="mb-6">
        <AgendaTvQrLink />
      </div>

      <div className="space-y-3">
        {eventos.map((ev) => (
          <Link
            key={ev.id}
            href={`/dashboard/agenda/${ev.id}`}
            className="flex items-center gap-4 bg-white rounded-xl p-4 border border-zinc-200 shadow-sm hover:shadow-igb hover:border-igb-yellow/40 transition-all group"
          >
            <div className="flex-shrink-0 w-16 text-center">
              <p className="text-xs font-bold text-zinc-400 uppercase">
                {new Date(`${ev.fecha}T00:00:00`).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
              </p>
              <p className="text-sm font-headline font-bold text-zinc-900">{ev.hora_inicio.slice(0, 5)}</p>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-headline font-bold text-zinc-900 text-sm truncate">
                {ev.grua?.nombre ?? 'Grúa'} · {ev.empresa?.nombre ?? 'Empresa'}
              </p>
              <div className="flex items-center gap-4 mt-1 text-xs text-zinc-400">
                {ev.ubicacion && (
                  <span className="flex items-center gap-1 truncate">
                    <MapPin size={12} /> {ev.ubicacion}
                  </span>
                )}
                {ev.operarios.length > 0 && (
                  <span className="flex items-center gap-1 flex-shrink-0">
                    <Users size={12} /> {ev.operarios.length}
                  </span>
                )}
              </div>
            </div>

            <span className={`text-xs font-bold px-2 py-1 rounded flex-shrink-0 ${ESTADO_STYLES[ev.estado] ?? ESTADO_STYLES.programado}`}>
              {ev.estado}
            </span>

            <ChevronRight
              size={16}
              className="text-zinc-300 group-hover:text-igb-yellow-dark group-hover:translate-x-1 transition-all flex-shrink-0"
            />
          </Link>
        ))}

        {eventos.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
            <p className="text-zinc-400 text-sm">No hay eventos programados.</p>
            <Link
              href="/dashboard/agenda/nuevo"
              className="inline-flex items-center gap-2 mt-4 text-igb-yellow-dark font-bold text-sm hover:underline"
            >
              <Plus size={14} /> Cargar el primero
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
