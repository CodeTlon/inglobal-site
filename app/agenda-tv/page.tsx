import Image from 'next/image'
import { getEventosAgenda } from '@/lib/agenda'
import AgendaReadOnlyView from '@/components/agenda/AgendaReadOnlyView'
import AgendaTvRefresher from './AgendaTvRefresher'

export const dynamic = 'force-dynamic'

export default async function AgendaTvPage() {
  const eventos = await getEventosAgenda({ desde: new Date().toISOString().slice(0, 10) })

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 overflow-y-auto">
      <AgendaTvRefresher />

      <header className="flex items-center gap-4 px-10 py-6 border-b border-white/10">
        <Image src="/images/logo.png" alt="InGlobal" width={140} height={44} className="h-10 w-auto object-contain" sizes="140px" />
        <h1 className="text-2xl font-headline font-bold text-white ml-2">Agenda de Grúas</h1>
        <span className="ml-auto text-sm text-slate-400">
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </header>

      <main className="px-10 py-8 max-w-5xl mx-auto">
        <AgendaReadOnlyView eventos={eventos} />
      </main>
    </div>
  )
}
