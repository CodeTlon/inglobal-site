import Link from 'next/link'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Suspense } from 'react'
import { getEventosAgenda } from '@/lib/agenda'
import AgendaWeekView from '@/components/agenda/AgendaWeekView'
import AgendaDayView from '@/components/agenda/AgendaDayView'
import AgendaKioskHeader from '@/components/agenda/AgendaKioskHeader'
import { getWeekStart, addDays, toDateInput, hoyArgentina, estadoStripColor } from '@/lib/agenda-view'

export const dynamic = 'force-dynamic'

// Placeholder mientras carga el día/semana nuevo. Sin esto, cambiar solo el
// searchParam (?day= / ?week=) sin recargar toda la ruta no re-dispara
// loading.tsx — Next deja el período ANTERIOR visible hasta que llega la data
// nueva, que es el "parpadeo: muestra el día de ayer y recién después el de
// hoy" reportado. Envolver el contenido que depende de la fecha en
// <Suspense key={...}> fuerza a que se re-suspenda cuando esa key cambia.
function GridSkeleton() {
  return <div className="h-64 flex-1 rounded-lg bg-zinc-100 animate-pulse" />
}

async function DayPanel({ dayKey }: { dayKey: string }) {
  const eventosDelDia = await getEventosAgenda({ desde: dayKey, hasta: dayKey })
  return <AgendaDayView eventos={eventosDelDia} dayKey={dayKey} />
}

async function WeekPanel({ weekStart }: { weekStart: Date }) {
  const weekEnd = addDays(weekStart, 6)
  const eventosSemana = await getEventosAgenda({ desde: toDateInput(weekStart), hasta: toDateInput(weekEnd) })
  return <AgendaWeekView eventos={eventosSemana} weekKey={toDateInput(weekStart)} hoy={hoyArgentina()} />
}

export default async function AgendaCalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; day?: string }>
}) {
  const { week, day } = await searchParams

  const base = week ? new Date(`${week}T00:00:00`) : new Date()
  const weekStart = getWeekStart(base)
  const weekEnd = addDays(weekStart, 6)
  const weekKey = toDateInput(weekStart)
  const prevWeek = toDateInput(addDays(weekStart, -7))
  const nextWeek = toDateInput(addDays(weekStart, 7))

  const dayDate = day ? new Date(`${day}T00:00:00`) : new Date()
  const dayKey = toDateInput(dayDate)
  const prevDay = toDateInput(addDays(dayDate, -1))
  const nextDay = toDateInput(addDays(dayDate, 1))

  return (
    // z-110: por encima del shell fijo del panel (z-[100]) — misma técnica que /agenda-tv usa para tapar Navbar/Footer del layout raíz.
    <div className="fixed inset-0 z-110 flex flex-col bg-white">
      <AgendaKioskHeader title="Calendario" backHref="/dashboard/agenda" theme="light" />
      <main className="flex min-h-0 flex-1 flex-col px-4 sm:px-6 py-3 md:overflow-hidden overflow-y-auto">
        {/* Mobile: un día a la vez — una grilla de franjas horarias de la semana entera
            no entra legible en una pantalla angosta (era el reclamo real). */}
        <div className="md:hidden pb-4">
          <div className="flex items-center justify-between mb-4">
            <Link href={`?day=${prevDay}`} className="text-zinc-400 hover:text-zinc-900 flex items-center gap-1 text-sm">
              <ChevronLeft size={16} />
            </Link>
            <p className="text-zinc-900 text-sm font-bold capitalize text-center">
              {dayDate.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' })}
            </p>
            <Link href={`?day=${nextDay}`} className="text-zinc-400 hover:text-zinc-900 flex items-center gap-1 text-sm">
              <ChevronRight size={16} />
            </Link>
          </div>
          <div className="flex justify-end mb-3">
            <Link
              href={`/dashboard/agenda/nuevo?fecha=${dayKey}&from=${encodeURIComponent(`/dashboard/agenda/calendario?day=${dayKey}`)}`}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-igb-navy hover:underline"
            >
              <Plus size={16} /> Nuevo evento
            </Link>
          </div>
          <Suspense key={dayKey} fallback={<GridSkeleton />}>
            <DayPanel dayKey={dayKey} />
          </Suspense>
        </div>

        {/* Desktop/tablet: semana en 7 columnas que entran en pantalla (sin scroll, es la vista de la TV) */}
        <div className="hidden min-h-0 flex-1 flex-col gap-3 md:flex">
          <div className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="flex items-center gap-4">
              <Link href={`?week=${prevWeek}`} className="flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900">
                <ChevronLeft size={16} /> Anterior
              </Link>
              <Link href={`?week=${toDateInput(getWeekStart(new Date()))}`} className="text-sm font-semibold text-zinc-400 hover:text-zinc-900">
                Hoy
              </Link>
            </div>
            <p className="text-base font-bold text-zinc-900">
              {weekStart.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} –{' '}
              {weekEnd.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
            </p>
            <div className="flex items-center justify-end gap-4">
              <ul className="hidden items-center gap-3 whitespace-nowrap text-xs text-zinc-500 2xl:flex">
                {([['reserva', 'Reserva'], ['programado', 'Programado'], ['en_curso', 'En curso'], ['finalizado', 'Finalizado'], ['cancelado', 'Cancelado']] as const).map(([k, l]) => (
                  <li key={k} className="flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${estadoStripColor(k)}`} />
                    {l}
                  </li>
                ))}
              </ul>
              <Link
                href={`/dashboard/agenda/nuevo?fecha=${weekKey}&from=${encodeURIComponent(`/dashboard/agenda/calendario?week=${weekKey}`)}`}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-igb-navy px-4 py-1.5 text-sm font-bold text-white hover:opacity-90"
              >
                <Plus size={16} /> Nuevo evento
              </Link>
              <Link href={`?week=${nextWeek}`} className="flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900">
                Siguiente <ChevronRight size={16} />
              </Link>
            </div>
          </div>
          <Suspense key={weekKey} fallback={<GridSkeleton />}>
            <WeekPanel weekStart={weekStart} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
