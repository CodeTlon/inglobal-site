import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getEventosAgenda } from '@/lib/agenda'
import AgendaMonthView from '@/components/agenda/AgendaMonthView'
import AgendaKioskHeader from '@/components/agenda/AgendaKioskHeader'
import AgendaTvRefresher from './AgendaTvRefresher'
import EstadoLegend from '@/components/agenda/EstadoLegend'
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
  const esMesActual = month.getFullYear() === new Date().getFullYear() && month.getMonth() === new Date().getMonth()

  // Botones grandes a propósito: esta pantalla se maneja desde lejos (remoto/puntero de TV),
  // no con mouse de cerca como el dashboard — el target chico de un link de texto no sirve acá.
  const navBtn = 'flex items-center gap-2 rounded-full border border-zinc-200 px-5 py-3 text-base font-semibold text-zinc-600 hover:bg-zinc-50 active:scale-95 transition-transform'

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-hidden flex flex-col">
      <AgendaKioskHeader title="Agenda de Grúas" theme="light" />
      <AgendaTvRefresher />
      <main className="flex-1 min-h-0 flex flex-col px-4 sm:px-10 py-8">
        {/* ponytail: <a> planas en vez de next/link — esta pantalla es un kiosco
            desatendido con force-dynamic + auto-reload cada 60s (AgendaTvRefresher);
            el prefetch/router cache de Link podía servir un payload de otro mes ya
            cacheado (eventos vacíos, reloj viejo) al volver al mes actual. */}
        <div className="shrink-0 flex items-center justify-between gap-3 mb-6">
          <a href={`?month=${prevMonth}`} className={navBtn}>
            <ChevronLeft size={22} /> Mes anterior
          </a>
          <div className="flex flex-col items-center gap-2">
            <p className="text-zinc-900 text-lg font-bold capitalize">
              {month.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
            </p>
            {!esMesActual && (
              <a href="?" className="text-sm font-semibold text-igb-navy hover:underline">
                ← Volver a hoy
              </a>
            )}
          </div>
          <a href={`?month=${nextMonth}`} className={navBtn}>
            Mes siguiente <ChevronRight size={22} />
          </a>
        </div>
        <div className="shrink-0">
          <EstadoLegend />
        </div>
        <AgendaMonthView eventos={eventos} month={month} className="flex-1 min-h-0" />
      </main>
    </div>
  )
}
