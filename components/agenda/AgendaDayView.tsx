'use client'

import { useState } from 'react'
import { CalendarX2 } from 'lucide-react'
import type { EventoAgenda } from '@/lib/agenda'
import { estadoColorClassesLight, getEstadoVisual, formatEstado } from '@/lib/agenda-view'
import AgendaEventModal from './AgendaEventModal'

/**
 * Vista de un solo día — lista cronológica (no grilla de horarios como
 * AgendaWeekView) porque en una pantalla angosta una grilla de 24 franjas
 * queda ilegible; una lista ordenada por hora es lo que realmente se puede
 * leer en mobile. Click en un evento abre el mismo detalle que la semanal.
 */
export default function AgendaDayView({ eventos }: { eventos: EventoAgenda[] }) {
  const [selected, setSelected] = useState<EventoAgenda | null>(null)
  const ordenados = [...eventos].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))

  if (ordenados.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-zinc-400">
        <CalendarX2 size={28} />
        <p className="text-sm">No hay eventos programados este día.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {ordenados.map((ev) => {
        const visual = getEstadoVisual(ev)
        return (
          <button
            key={ev.id}
            type="button"
            onClick={() => setSelected(ev)}
            className={`w-full flex items-start gap-3 rounded-lg border px-3 py-3 text-left transition-all hover:brightness-95 ${estadoColorClassesLight(visual)}`}
          >
            <div className="flex-shrink-0 w-14 text-sm font-bold">
              {ev.hora_inicio.slice(0, 5)}
              {ev.hora_fin && <span className="block text-xs font-normal opacity-70">a {ev.hora_fin.slice(0, 5)}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{ev.grua?.nombre ?? 'Grúa'} · {ev.empresa?.nombre ?? 'Empresa'}</p>
              {ev.ubicacion && <p className="text-xs truncate opacity-80">{ev.ubicacion}</p>}
              <p className="text-[11px] mt-1 opacity-70">{formatEstado(visual)}</p>
            </div>
          </button>
        )
      })}

      <AgendaEventModal evento={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
