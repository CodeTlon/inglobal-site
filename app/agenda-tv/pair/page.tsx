import AgendaKioskHeader from '@/components/agenda/AgendaKioskHeader'
import PairQr from './PairQr'

// Sin auth (a diferencia de /agenda-tv) — es precisamente la pantalla para una TV que
// TODAVÍA no tiene sesión. Ver el carve-out correspondiente en middleware.ts.
// force-dynamic: sin esto Next cachea el HTML (Full Route Cache) y un deploy nuevo
// no se ve hasta que ese cache expira solo — la pantalla de pairing no puede quedar sirviendo una versión vieja.
export const dynamic = 'force-dynamic'

export default function AgendaTvPairPage() {
  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
      <AgendaKioskHeader title="Vincular esta TV" theme="light" />
      <div className="px-10 py-16 flex items-center justify-center">
        <PairQr />
      </div>
    </div>
  )
}
