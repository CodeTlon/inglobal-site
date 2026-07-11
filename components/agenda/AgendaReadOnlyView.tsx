import type { EventoAgenda } from '@/lib/agenda'
import { MapPin, Users, Truck } from 'lucide-react'

function diffDays(fecha: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${fecha}T00:00:00`)
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

function groupEventos(eventos: EventoAgenda[]) {
  return {
    hoy: eventos.filter((e) => diffDays(e.fecha) === 0),
    manana: eventos.filter((e) => diffDays(e.fecha) === 1),
    semana: eventos.filter((e) => diffDays(e.fecha) >= 2 && diffDays(e.fecha) <= 6),
    proximamente: eventos.filter((e) => diffDays(e.fecha) > 6),
  }
}

function EventoRow({ evento }: { evento: EventoAgenda }) {
  return (
    <div className="flex items-center gap-6 bg-white/5 rounded-2xl px-6 py-5 border border-white/10">
      <div className="flex-shrink-0 w-24 text-center">
        <p className="text-3xl font-headline font-extrabold text-igb-yellow tabular-nums">
          {evento.hora_inicio.slice(0, 5)}
        </p>
        {evento.hora_fin && (
          <p className="text-sm text-slate-400 tabular-nums">hasta {evento.hora_fin.slice(0, 5)}</p>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-2xl font-headline font-bold text-white flex items-center gap-2 truncate">
          <Truck size={20} className="text-igb-yellow flex-shrink-0" />
          {evento.grua?.nombre ?? 'Grúa'}
          <span className="text-slate-500">·</span>
          {evento.empresa?.nombre ?? 'Empresa'}
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-2 text-lg text-slate-300">
          {evento.ubicacion && (
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-slate-500" /> {evento.ubicacion}
            </span>
          )}
          {evento.operarios.length > 0 && (
            <span className="flex items-center gap-2">
              <Users size={16} className="text-slate-500" /> {evento.operarios.map((o) => o.nombre).join(', ')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ title, eventos }: { title: string; eventos: EventoAgenda[] }) {
  if (eventos.length === 0) return null
  return (
    <section>
      <h2 className="text-xl font-headline font-bold uppercase tracking-widest text-igb-yellow-dark mb-4">
        {title}
      </h2>
      <div className="space-y-3">
        {eventos.map((ev) => (
          <EventoRow key={ev.id} evento={ev} />
        ))}
      </div>
    </section>
  )
}

/**
 * Listado de eventos agrupado por proximidad (Hoy/Mañana/Semana/Próximamente), solo lectura
 * — sin links de edición ni borrado. Usado por /agenda-tv (kiosco) y por la vista de calendario
 * del dashboard (jefes que solo quieren consultar, sin pasar por la vista de carga de eventos).
 */
export default function AgendaReadOnlyView({ eventos }: { eventos: EventoAgenda[] }) {
  const { hoy, manana, semana, proximamente } = groupEventos(eventos)

  return (
    <div className="space-y-10">
      <Section title="Hoy" eventos={hoy} />
      <Section title="Mañana" eventos={manana} />
      <Section title="Esta semana" eventos={semana} />
      <Section title="Próximamente" eventos={proximamente} />

      {eventos.length === 0 && (
        <p className="text-center text-slate-500 text-xl py-24">No hay eventos programados.</p>
      )}
    </div>
  )
}
