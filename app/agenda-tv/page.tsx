import { getEventosAgenda } from '@/lib/agenda'
import AgendaMonthView from '@/components/agenda/AgendaMonthView'
import AgendaKioskHeader from '@/components/agenda/AgendaKioskHeader'
import AgendaTvRefresher from './AgendaTvRefresher'
import { toDateInput } from '@/lib/agenda-view'

export const dynamic = 'force-dynamic'

export default async function AgendaTvPage() {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const eventos = await getEventosAgenda({ desde: toDateInput(first), hasta: toDateInput(last) })

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 overflow-y-auto">
      <AgendaTvRefresher />
      <AgendaKioskHeader title="Agenda de Grúas" />
      <main className="px-10 py-8 max-w-6xl mx-auto">
        <AgendaMonthView eventos={eventos} month={now} />
      </main>
    </div>
  )
}
