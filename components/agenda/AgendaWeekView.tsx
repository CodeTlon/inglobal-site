'use client'

import { useEffect, useRef, useState } from 'react'
import type { EventoAgenda } from '@/lib/agenda'
import { getWeekDays, getEstadoVisual, toDateInput, finDiaEfectivoEvento, formatEstado, nombresGruas, estadoStripColor } from '@/lib/agenda-view'
import AgendaEventModal from './AgendaEventModal'

const DIA_LABEL = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

/** Eventos del día `key` (incluye los que vienen de días anteriores), ordenados por hora de arranque de ESE día. */
function eventosDelDia(eventos: EventoAgenda[], key: string): EventoAgenda[] {
  // finDiaEfectivo (no `fecha_hasta ?? fecha`): un turno nocturno sin `fecha_hasta`
  // (22:00→02:00) sigue vigente al día siguiente.
  const delDia = eventos.filter((ev) => key >= ev.fecha && key <= finDiaEfectivoEvento(ev))
  const arranque = (ev: EventoAgenda) => (key === ev.fecha ? ev.hora_inicio : '00:00').slice(0, 5)
  const fin = (ev: EventoAgenda) => (ev.hora_fin ?? '23:59').slice(0, 5)
  // Hora de inicio, luego de fin, luego empresa: orden estable cuando varios arrancan a la misma hora.
  return delDia.sort(
    (a, b) =>
      arranque(a).localeCompare(arranque(b)) ||
      fin(a).localeCompare(fin(b)) ||
      (a.empresa?.nombre ?? '').localeCompare(b.empresa?.nombre ?? ''),
  )
}

function horaLabel(ev: EventoAgenda, key: string): string {
  if (key !== ev.fecha) return 'cont.'
  const ini = ev.hora_inicio.slice(0, 5)
  return key === finDiaEfectivoEvento(ev) && ev.hora_fin ? `${ini}–${ev.hora_fin.slice(0, 5)}` : ini
}

function EventoCard({
  ev,
  dayKey,
  dayIdx,
  idx,
  onClick,
}: {
  ev: EventoAgenda
  dayKey: string
  dayIdx: number
  idx: number
  onClick: (el: HTMLElement) => void
}) {
  const visual = getEstadoVisual(ev)
  const apagado = visual === 'finalizado' || visual === 'cancelado'
  return (
    <button
      type="button"
      data-day={dayIdx}
      data-idx={idx}
      onClick={(e) => onClick(e.currentTarget)}
      // Foco bien visible: en la tele se navega con las flechas del control y hay que saber dónde se está parado.
      className={`relative flex w-full shrink-0 flex-col justify-center gap-[0.15em] overflow-hidden rounded-[0.6em] border border-zinc-200 bg-white py-[0.55em] pl-[1em] pr-[0.6em] text-left shadow-xs transition-colors hover:border-zinc-400 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-igb-navy focus-visible:ring-offset-2 ${apagado ? 'opacity-60 focus-visible:opacity-100' : ''}`}
      title={[
        `${ev.empresa?.nombre ?? 'Empresa'} · ${nombresGruas(ev)}`,
        `${horaLabel(ev, dayKey)} · ${formatEstado(visual)}`,
        ev.operarios.length > 0 ? ev.operarios.map((o) => o.nombre).join(', ') : null,
      ].filter(Boolean).join('\n')}
    >
      <span className={`absolute inset-y-0 left-0 w-[0.4em] ${estadoStripColor(visual)}`} />
      <span className={`truncate text-[1em] font-bold leading-tight text-zinc-900 ${visual === 'cancelado' ? 'line-through' : ''}`}>
        {ev.empresa?.nombre ?? 'Empresa'}
      </span>
      <span className="truncate text-[0.85em] leading-tight text-zinc-500">
        <span className="font-semibold text-zinc-700">{horaLabel(ev, dayKey)}</span> · {nombresGruas(ev, ', ')}
      </span>
    </button>
  )
}

/**
 * Semana en 7 columnas que ENTRAN en la pantalla: la página no scrollea ni a lo ancho ni a lo
 * alto a 100% de zoom (es la vista de la TV). No es una grilla horaria proporcional: con muchos
 * servicios simultáneos esa grilla se vuelve ilegible. Cada día lista sus servicios por hora
 * (empresa primero, grúa debajo) y, si no entran, ESA columna scrollea por dentro.
 *
 * Pensada para control remoto: flechas ↑↓ recorren los servicios del día, ←→ saltan al día
 * vecino con servicios, OK (Enter) abre el detalle y Esc/Atrás lo cierra. El foco se ve grande
 * y la columna scrollea sola para mantener visible el servicio enfocado. Los tamaños son `em`
 * sobre un font-size que escala con el ancho de pantalla, así sirve en cualquier tele.
 */
export default function AgendaWeekView({ eventos, weekKey, hoy }: { eventos: EventoAgenda[]; weekKey: string; hoy: string }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const volverA = useRef<HTMLElement | null>(null)
  const [selected, setSelected] = useState<EventoAgenda | null>(null)
  // weekKey (YYYY-MM-DD) y no un Date: un Date serializado server->client llega como
  // medianoche UTC y en el navegador (UTC-3) cae el día anterior, corriendo toda la grilla.
  const [y, m, d0] = weekKey.split('-').map(Number)
  const days = getWeekDays(new Date(y, m - 1, d0))
  const dayKeys = days.map(toDateInput)
  const porDia = dayKeys.map((k) => eventosDelDia(eventos, k))

  // Al entrar, el foco cae en el primer servicio de hoy (o del primer día con servicios): con el
  // control remoto las flechas funcionan de una, sin tener que "entrar" a la grilla.
  useEffect(() => {
    const hoyIdx = dayKeys.indexOf(hoy)
    const orden = [...(hoyIdx >= 0 ? [hoyIdx] : []), ...dayKeys.keys()]
    const dia = orden.find((i) => porDia[i].length > 0)
    if (dia !== undefined) rootRef.current?.querySelector<HTMLElement>(`[data-day="${dia}"][data-idx="0"]`)?.focus({ preventScroll: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekKey])

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const t = e.target as HTMLElement
    if (t.dataset.day === undefined) return
    const dia = Number(t.dataset.day)
    const idx = Number(t.dataset.idx)
    const foco = (d: number, i: number) =>
      rootRef.current?.querySelector<HTMLElement>(`[data-day="${d}"][data-idx="${i}"]`)?.focus()
    if (e.key === 'ArrowDown' && idx + 1 < porDia[dia].length) foco(dia, idx + 1)
    else if (e.key === 'ArrowUp' && idx > 0) foco(dia, idx - 1)
    else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const paso = e.key === 'ArrowRight' ? 1 : -1
      for (let d = dia + paso; d >= 0 && d < porDia.length; d += paso) {
        if (porDia[d].length > 0) {
          foco(d, Math.min(idx, porDia[d].length - 1))
          break
        }
      }
    } else return
    e.preventDefault()
  }

  function cerrar() {
    setSelected(null)
    // Devuelve el foco al servicio que se abrió, para seguir navegando desde ahí.
    queueMicrotask(() => volverA.current?.focus({ preventScroll: true }))
  }

  return (
    <div
      ref={rootRef}
      onKeyDown={onKeyDown}
      className="grid min-h-0 flex-1 grid-cols-7 grid-rows-[minmax(0,1fr)] gap-[0.6em]"
      // Escala con la pantalla: ~14px en un monitor chico, ~21px en una tele 1080p, tope 32px en 4K.
      style={{ fontSize: 'clamp(13px, 1.1vw, 32px)' }}
    >
      {days.map((d, i) => {
        const esHoy = dayKeys[i] === hoy
        const lista = porDia[i]
        return (
          <section
            key={dayKeys[i]}
            className={`flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[0.9em] border ${esHoy ? 'border-igb-navy/40 bg-igb-yellow/10' : 'border-zinc-200 bg-zinc-50/60'}`}
          >
            <header className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-200/80 px-[0.8em] py-[0.5em]">
              <span className="flex items-baseline gap-[0.5em]">
                <span className="text-[0.8em] font-bold uppercase tracking-widest text-zinc-400">{DIA_LABEL[i]}</span>
                <span
                  className={`inline-flex min-w-[1.7em] items-center justify-center rounded-full px-[0.2em] py-[0.1em] text-[1.3em] font-bold leading-none ${esHoy ? 'bg-igb-navy text-white' : 'text-zinc-900'}`}
                >
                  {d.getDate()}
                </span>
              </span>
              {lista.length > 0 && (
                <span className="rounded-full bg-zinc-200/70 px-[0.6em] py-[0.15em] text-[0.8em] font-bold text-zinc-600">{lista.length}</span>
              )}
            </header>
            <div className="dashboard-scroll-light flex min-h-0 flex-1 scroll-py-[0.6em] flex-col gap-[0.4em] overflow-y-auto overflow-x-hidden p-[0.5em]">
              {lista.map((ev, j) => (
                <EventoCard
                  key={`${ev.id}-${dayKeys[i]}`}
                  ev={ev}
                  dayKey={dayKeys[i]}
                  dayIdx={i}
                  idx={j}
                  onClick={(el) => {
                    volverA.current = el
                    setSelected(ev)
                  }}
                />
              ))}
            </div>
          </section>
        )
      })}

      <AgendaEventModal
        evento={selected}
        onClose={cerrar}
        editHref={
          selected
            ? `/dashboard/agenda/${selected.id}?from=${encodeURIComponent(`/dashboard/agenda/calendario?week=${weekKey}`)}`
            : undefined
        }
      />
    </div>
  )
}
