import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Suspense } from 'react'
import { getEventosAgenda } from '@/lib/agenda'
import AgendaWeekView from '@/components/agenda/AgendaWeekView'
import AgendaDayView from '@/components/agenda/AgendaDayView'
import AgendaKioskHeader from '@/components/agenda/AgendaKioskHeader'
import { getWeekStart, addDays, toDateInput } from '@/lib/agenda-view'

export const dynamic = 'force-dynamic'

// Placeholder mientras carga el día/semana nuevo. Sin esto, cambiar solo el
// searchParam (?day= / ?week=) sin recargar toda la ruta no re-dispara
// loading.tsx — Next deja el período ANTERIOR visible hasta que llega la data
// nueva, que es el "parpadeo: muestra el día de ayer y recién después el de
// hoy" reportado. Envolver el contenido que depende de la fecha en
// <Suspense key={...}> fuerza a que se re-suspenda cuando esa key cambia.
function GridSkeleton() {
  return <div className="h-64 rounded-lg bg-zinc-100 animate-pulse" />
}

async function DayPanel({ dayKey }: { dayKey: string }) {
  const eventosDelDia = await getEventosAgenda({ desde: dayKey, hasta: dayKey })
  return <AgendaDayView eventos={eventosDelDia} />
}

async function WeekPanel({ weekStart }: { weekStart: Date }) {
  const weekEnd = addDays(weekStart, 6)
  const eventosSemana = await getEventosAgenda({ desde: toDateInput(weekStart), hasta: toDateInput(weekEnd) })
  return <AgendaWeekView eventos={eventosSemana} weekStart={weekStart} />
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
    // z-[110]: por encima del shell fijo del panel (z-[100]) — misma técnica que /agenda-tv usa para tapar Navbar/Footer del layout raíz.
    <div className="fixed inset-0 z-[110] bg-white overflow-y-auto">
      <AgendaKioskHeader title="Calendario" backHref="/dashboard/agenda" theme="light" />
      <main className="px-4 sm:px-8 py-6">
        {/* Mobile: un día a la vez — una grilla de franjas horarias de la semana entera
            no entra legible en una pantalla angosta (era el reclamo real). */}
        <div className="md:hidden">
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
          <Suspense key={dayKey} fallback={<GridSkeleton />}>
            <DayPanel dayKey={dayKey} />
          </Suspense>
        </div>

        {/* Desktop/tablet: semana completa en grilla de horarios */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between mb-4">
            <Link href={`?week=${prevWeek}`} className="text-zinc-400 hover:text-zinc-900 flex items-center gap-1 text-sm">
              <ChevronLeft size={16} /> Semana anterior
            </Link>
            <p className="text-zinc-900 text-sm font-bold">
              {weekStart.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} –{' '}
              {weekEnd.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
            </p>
            <Link href={`?week=${nextWeek}`} className="text-zinc-400 hover:text-zinc-900 flex items-center gap-1 text-sm">
              Semana siguiente <ChevronRight size={16} />
            </Link>
          </div>
          <Suspense key={weekKey} fallback={<GridSkeleton />}>
            <WeekPanel weekStart={weekStart} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
