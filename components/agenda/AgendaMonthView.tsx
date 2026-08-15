'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { EventoAgenda } from '@/lib/agenda'
import { getMonthMatrix, estadoColorClassesLight, getEstadoVisual, toDateInput, addDays } from '@/lib/agenda-view'
import AgendaEventModal from './AgendaEventModal'

const DIA_LABEL = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

/**
 * Grilla mensual clásica (semanas x días) — cada celda muestra cantidad + primeros eventos.
 * Tema claro, igual que AgendaWeekView, para que la TV no desentone del resto del sitio.
 * Click en un evento abre su detalle en AgendaEventModal (mismo componente que la vista semanal).
 */
export default function AgendaMonthView({
  eventos,
  month,
  className = '',
}: {
  eventos: EventoAgenda[]
  month: Date
  className?: string
}) {
  const [selected, setSelected] = useState<EventoAgenda | null>(null)
  const [selectedDay, setSelectedDay] = useState<{ key: string; eventos: EventoAgenda[] } | null>(null)

  useEffect(() => {
    if (!selectedDay) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelectedDay(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedDay])

  const todayKey = toDateInput(new Date())
  const weeks = getMonthMatrix(month)
  const byDay = new Map<string, EventoAgenda[]>()
  for (const ev of eventos) {
    // Evento de varios días (fecha_hasta) — aparece en cada día de su rango,
    // no solo en el día en que arrancó.
    const finEv = ev.fecha_hasta ?? ev.fecha
    for (let d = ev.fecha; d <= finEv; d = toDateInput(addDays(new Date(`${d}T00:00:00`), 1))) {
      const list = byDay.get(d) ?? []
      list.push(ev)
      byDay.set(d, list)
    }
  }

  return (
    <div
      className={`grid grid-cols-7 gap-2 ${className}`}
      // Fila de encabezado a su alto natural, las semanas se reparten el resto
      // en partes iguales — para que el mes entre completo en la pantalla de
      // la TV sin scroll (antes las celdas crecían sin techo con min-h).
      style={{ gridTemplateRows: `auto repeat(${weeks.length}, 1fr)` }}
    >
      {DIA_LABEL.map((d) => (
        <div key={d} className="text-center text-base uppercase tracking-widest text-zinc-400 pb-2">
          {d}
        </div>
      ))}

      {weeks.flatMap((week) =>
        week.map((day) => {
          const key = toDateInput(day)
          const isCurrentMonth = day.getMonth() === month.getMonth()
          const dayEventos = (byDay.get(key) ?? []).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
          const isToday = key === todayKey
          return (
            <div
              key={key}
              className={`h-full overflow-hidden rounded-lg border p-3.5 ${
                isToday ? 'border-igb-yellow border-2 bg-igb-yellow/5' : 'border-zinc-200'
              } ${isCurrentMonth ? 'bg-white' : 'bg-zinc-50 opacity-50'}`}
            >
              <p className="text-2xl font-bold text-zinc-900 mb-2">{day.getDate()}</p>
              {dayEventos.length > 0 && (
                <p className="text-base text-igb-yellow-dark font-bold mb-2">
                  {dayEventos.length} evento{dayEventos.length > 1 ? 's' : ''}
                </p>
              )}
              <div className="space-y-1.5">
                {dayEventos.slice(0, 3).map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => setSelected(ev)}
                    title={`${ev.grua?.nombre ?? 'Grúa'} · ${ev.empresa?.nombre ?? 'Empresa'}`}
                    className={`w-full rounded px-2 py-1.5 border text-left cursor-pointer hover:brightness-95 transition-all ${estadoColorClassesLight(getEstadoVisual(ev))}`}
                  >
                    <p className="text-sm font-bold truncate">
                      {ev.hora_inicio.slice(0, 5)} {ev.grua?.nombre ?? 'Grúa'}
                    </p>
                    <p className="text-xs truncate opacity-80">{ev.empresa?.nombre ?? 'Empresa'}</p>
                  </button>
                ))}
                {dayEventos.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setSelectedDay({ key, eventos: dayEventos })}
                    className="w-full text-base font-bold text-igb-navy hover:underline text-left px-2 py-1.5 cursor-pointer"
                  >
                    +{dayEventos.length - 3} más
                  </button>
                )}
              </div>
            </div>
          )
        }),
      )}

      {selectedDay && (
        <div className="fixed inset-0 z-[200] bg-black/40 p-4 flex items-start justify-center overflow-y-auto" onClick={() => setSelectedDay(null)}>
          <div
            className="mt-16 w-full max-w-md rounded-2xl bg-white border border-zinc-200 p-6 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <p className="text-lg font-bold text-zinc-900 capitalize">
                {new Date(`${selectedDay.key}T00:00:00`).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                aria-label="Cerrar"
                className="rounded-full p-2.5 -m-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-2 overflow-y-auto tv-scroll pr-1">
              {selectedDay.eventos.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => {
                    setSelected(ev)
                    setSelectedDay(null)
                  }}
                  className={`w-full text-base font-semibold truncate rounded-lg px-3 py-3 border text-left cursor-pointer hover:brightness-95 transition-all ${estadoColorClassesLight(getEstadoVisual(ev))}`}
                >
                  {ev.hora_inicio.slice(0, 5)} {ev.grua?.nombre ?? 'Grúa'} · {ev.empresa?.nombre ?? 'Empresa'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <AgendaEventModal evento={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
