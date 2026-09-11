'use client'

import { useState } from 'react'
import type { EventoAgenda } from '@/lib/agenda'
import { getWeekDays, estadoColorClassesLight, getEstadoVisual, layoutDayEvents, toDateInput, finDiaEfectivoEvento } from '@/lib/agenda-view'
import AgendaEventModal from './AgendaEventModal'

const START_HOUR = 7
const END_HOUR = 19
const SLOT_MINUTES = 30 // ponytail: única constante a tocar si se pide otra granularidad
const SLOTS = ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES
const DIA_LABEL = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function timeToSlot(time: string): number {
  const [h, m] = time.slice(0, 5).split(':').map(Number)
  const minutes = h * 60 + m - START_HOUR * 60
  return Math.min(Math.max(minutes / SLOT_MINUTES, 0), SLOTS)
}

/**
 * Grilla semanal (columnas = días, filas = franjas horarias) — solo lectura, click en un
 * evento abre su detalle en AgendaEventModal. Tema claro (calendario de jefes).
 * Mobile: mismo componente, el contenedor scrollea horizontal (min-w fijo en el grid).
 */
export default function AgendaWeekView({ eventos, weekStart }: { eventos: EventoAgenda[]; weekStart: Date }) {
  const [selected, setSelected] = useState<EventoAgenda | null>(null)
  const days = getWeekDays(weekStart)
  const dayKeys = days.map(toDateInput)

  return (
    <div className="overflow-x-auto dashboard-scroll-light">
      <div
        className="grid min-w-[900px]"
        style={{
          gridTemplateColumns: `64px repeat(7, minmax(140px, 1fr))`,
          gridTemplateRows: `48px repeat(${SLOTS}, 32px)`,
        }}
      >
        <div className="sticky left-0 z-10 bg-white" style={{ gridColumn: 1, gridRow: 1 }} />
        {days.map((d, i) => (
          <div
            key={dayKeys[i]}
            className="flex flex-col items-center justify-center border-b border-zinc-200"
            style={{ gridColumn: i + 2, gridRow: 1 }}
          >
            <span className="text-xs uppercase tracking-widest text-zinc-400">{DIA_LABEL[i]}</span>
            <span className="text-sm font-bold text-zinc-900">{d.getDate()}</span>
          </div>
        ))}

        {Array.from({ length: SLOTS }, (_, i) => {
          const totalMin = START_HOUR * 60 + i * SLOT_MINUTES
          const isHour = totalMin % 60 === 0
          return (
            <div
              key={`t-${i}`}
              className="sticky left-0 z-10 bg-white text-[11px] text-zinc-400 text-right pr-2 border-t border-zinc-100"
              style={{ gridColumn: 1, gridRow: i + 2 }}
            >
              {isHour ? `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:00` : ''}
            </div>
          )
        })}

        {days.map((_, dayIdx) =>
          Array.from({ length: SLOTS }, (_, i) => (
            <div
              key={`bg-${dayIdx}-${i}`}
              className="border-t border-zinc-100"
              style={{ gridColumn: dayIdx + 2, gridRow: i + 2 }}
            />
          )),
        )}

        {dayKeys.flatMap((key, dayIdx) => {
          // Evento de varios días (fecha_hasta) — se repite en cada columna de
          // día que caiga dentro de su rango y también sea parte de la semana visible.
          // finDiaEfectivo (no `fecha_hasta ?? fecha`): un turno nocturno sin
          // `fecha_hasta` (22:00→02:00) sigue vigente al día siguiente — con el
          // bound viejo esa columna nunca entraba acá y el evento desaparecía
          // de su día de continuación en la semana.
          const dayEventos = eventos.filter((ev) => key >= ev.fecha && key <= finDiaEfectivoEvento(ev))
          const layout = layoutDayEvents(dayEventos)
          return dayEventos.map((ev) => {
            // Turno nocturno (22:00→02:00) con o sin `fecha_hasta`: la
            // columna de un día intermedio/final de su rango NO arranca a
            // `ev.hora_inicio` (eso ya pasó un día anterior) ni termina a
            // `ev.hora_fin` salvo que ESTE sea el último día — antes se
            // usaban esos dos valores tal cual en cada columna, dibujando en
            // el día de continuación una card clavada en "22:00" con un
            // alto de un solo slot (el clamp de más abajo), en vez del
            // pedazo real [00:00, hora_fin) de ese día.
            const horaFinEfectiva = ev.hora_fin ?? '23:59'
            const finDia = finDiaEfectivoEvento(ev)
            const esDiaInicio = key === ev.fecha
            const esUltimoDia = key === finDia
            const horaInicioDelDia = esDiaInicio ? ev.hora_inicio : '00:00'
            const horaFinDelDia = esUltimoDia ? horaFinEfectiva : '23:59'
            const rowStart = Math.floor(timeToSlot(horaInicioDelDia)) + 2
            const rowEnd = Math.max(rowStart + 1, Math.ceil(timeToSlot(horaFinDelDia)) + 2)
            const visual = getEstadoVisual(ev)
            // Eventos que se solapan en horario el mismo día van lado a lado
            // (carriles), no apilados encima uno del otro.
            const slot = layout.get(ev) ?? { lane: 0, lanes: 1 }
            const widthPct = 100 / slot.lanes
            const laneStyle =
              slot.lanes > 1
                ? {
                    width: `calc(${widthPct}% - 0.25rem)`,
                    marginLeft: `calc(${widthPct * slot.lane}% + 0.25rem)`,
                  }
                : {}
            return (
              <button
                key={`${ev.id}-${key}`}
                type="button"
                onClick={() => setSelected(ev)}
                className={`m-1 rounded-lg border px-2 py-1 overflow-hidden text-left cursor-pointer hover:brightness-95 transition-all ${estadoColorClassesLight(visual)}`}
                style={{
                  gridColumn: dayIdx + 2,
                  gridRow: `${rowStart} / ${rowEnd}`,
                  ...laneStyle,
                }}
                title={`${ev.grua?.nombre ?? 'Grúa'} · ${ev.empresa?.nombre ?? 'Empresa'}`}
              >
                <p className="text-[11px] font-bold truncate">
                  {esDiaInicio ? horaInicioDelDia.slice(0, 5) : 'cont.'} {ev.grua?.nombre ?? 'Grúa'}
                </p>
                <p className="text-[10px] truncate opacity-80">{ev.empresa?.nombre ?? 'Empresa'}</p>
              </button>
            )
          })
        })}
      </div>

      {eventos.length === 0 && <p className="text-center text-zinc-400 py-16">No hay eventos programados esta semana.</p>}

      <AgendaEventModal
        evento={selected}
        onClose={() => setSelected(null)}
        editHref={
          selected
            ? `/dashboard/agenda/${selected.id}?from=${encodeURIComponent(`/dashboard/agenda/calendario?week=${toDateInput(weekStart)}`)}`
            : undefined
        }
      />
    </div>
  )
}
