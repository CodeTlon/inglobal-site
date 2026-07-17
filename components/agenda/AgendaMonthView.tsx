import type { EventoAgenda } from '@/lib/agenda'
import { getMonthMatrix, estadoColorClasses, getEstadoVisual, toDateInput, addDays } from '@/lib/agenda-view'

const DIA_LABEL = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

/** Grilla mensual clásica (semanas x días) — cada celda muestra cantidad + primeros eventos. Pensada para verse a distancia (kiosco TV), sin interacción. */
export default function AgendaMonthView({ eventos, month }: { eventos: EventoAgenda[]; month: Date }) {
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
    <div className="grid grid-cols-7 gap-1.5">
      {DIA_LABEL.map((d) => (
        <div key={d} className="text-center text-xs uppercase tracking-widest text-slate-400 pb-2">
          {d}
        </div>
      ))}

      {weeks.flatMap((week) =>
        week.map((day) => {
          const key = toDateInput(day)
          const isCurrentMonth = day.getMonth() === month.getMonth()
          const dayEventos = (byDay.get(key) ?? []).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
          return (
            <div
              key={key}
              className={`min-h-[110px] rounded-lg border border-white/10 p-2 ${
                isCurrentMonth ? 'bg-white/5' : 'bg-transparent opacity-40'
              }`}
            >
              <p className="text-sm font-bold text-white mb-1">{day.getDate()}</p>
              {dayEventos.length > 0 && (
                <p className="text-[11px] text-igb-yellow font-bold mb-1">
                  {dayEventos.length} evento{dayEventos.length > 1 ? 's' : ''}
                </p>
              )}
              <div className="space-y-0.5">
                {dayEventos.slice(0, 3).map((ev) => (
                  <p
                    key={ev.id}
                    className={`text-[10px] truncate rounded px-1 border ${estadoColorClasses(getEstadoVisual(ev))}`}
                  >
                    {ev.hora_inicio.slice(0, 5)} {ev.grua?.nombre ?? 'Grúa'}
                  </p>
                ))}
              </div>
            </div>
          )
        }),
      )}
    </div>
  )
}
