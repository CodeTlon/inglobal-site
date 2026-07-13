import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getEventosAgenda } from '@/lib/agenda'
import AgendaWeekView from '@/components/agenda/AgendaWeekView'
import AgendaKioskHeader from '@/components/agenda/AgendaKioskHeader'
import { getWeekStart, addDays, toDateInput } from '@/lib/agenda-view'

export const dynamic = 'force-dynamic'

export default async function AgendaCalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const { week } = await searchParams
  const base = week ? new Date(`${week}T00:00:00`) : new Date()
  const weekStart = getWeekStart(base)
  const weekEnd = addDays(weekStart, 6)
  const eventos = await getEventosAgenda({ desde: toDateInput(weekStart), hasta: toDateInput(weekEnd) })

  const prevWeek = toDateInput(addDays(weekStart, -7))
  const nextWeek = toDateInput(addDays(weekStart, 7))

  return (
    // z-[110]: por encima del shell fijo del panel (z-[100]) — misma técnica que /agenda-tv usa para tapar Navbar/Footer del layout raíz.
    <div className="fixed inset-0 z-[110] bg-slate-950 overflow-y-auto">
      <AgendaKioskHeader title="Calendario" backHref="/dashboard/agenda" />
      <main className="px-4 sm:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <Link href={`?week=${prevWeek}`} className="text-slate-400 hover:text-white flex items-center gap-1 text-sm">
            <ChevronLeft size={16} /> Semana anterior
          </Link>
          <p className="text-white text-sm font-bold">
            {weekStart.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} –{' '}
            {weekEnd.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
          </p>
          <Link href={`?week=${nextWeek}`} className="text-slate-400 hover:text-white flex items-center gap-1 text-sm">
            Semana siguiente <ChevronRight size={16} />
          </Link>
        </div>
        <AgendaWeekView eventos={eventos} weekStart={weekStart} />
      </main>
    </div>
  )
}
