import AgendaKioskHeader from '@/components/agenda/AgendaKioskHeader'
import PairQr from './PairQr'

// Sin auth (a diferencia de /agenda-tv) — es precisamente la pantalla para una TV que
// TODAVÍA no tiene sesión. Ver el carve-out correspondiente en middleware.ts.
export default function AgendaTvPairPage() {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 overflow-y-auto">
      <AgendaKioskHeader title="Vincular esta TV" />
      <div className="px-10 py-16 flex items-center justify-center">
        <PairQr />
      </div>
    </div>
  )
}
