import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getEventosAgenda } from '@/lib/agenda'
import AgendaMonthView from '@/components/agenda/AgendaMonthView'
import AgendaKioskHeader from '@/components/agenda/AgendaKioskHeader'
import AgendaTvRefresher from './AgendaTvRefresher'
import { toDateInput } from '@/lib/agenda-view'

export const dynamic = 'force-dynamic'

export default async function AgendaTvPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month: monthParam } = await searchParams
  const month = monthParam ? new Date(`${monthParam}-01T00:00:00`) : new Date()
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  const eventos = await getEventosAgenda({ desde: toDateInput(first), hasta: toDateInput(last) })

  const prevMonth = toDateInput(new Date(month.getFullYear(), month.getMonth() - 1, 1)).slice(0, 7)
  const nextMonth = toDateInput(new Date(month.getFullYear(), month.getMonth() + 1, 1)).slice(0, 7)

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
      <AgendaKioskHeader title="Agenda de Grúas" theme="light" />
      <AgendaTvRefresher />
      <main className="px-4 sm:px-10 py-8">
        <div className="flex items-center justify-between mb-4">
          <Link href={`?month=${prevMonth}`} className="text-zinc-400 hover:text-zinc-900 flex items-center gap-1 text-sm">
            <ChevronLeft size={16} /> Mes anterior
          </Link>
          <p className="text-zinc-900 text-sm font-bold capitalize">
            {month.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
          </p>
          <Link href={`?month=${nextMonth}`} className="text-zinc-400 hover:text-zinc-900 flex items-center gap-1 text-sm">
            Mes siguiente <ChevronRight size={16} />
          </Link>
        </div>
        <AgendaMonthView eventos={eventos} month={month} />
      </main>
    </div>
  )
}
