import Link from 'next/link'
import { getEventosAgenda } from '@/lib/agenda'
import AgendaReadOnlyView from '@/components/agenda/AgendaReadOnlyView'
import { ArrowLeft } from 'lucide-react'

export default async function AgendaCalendarioPage() {
  const eventos = await getEventosAgenda({ desde: new Date().toISOString().slice(0, 10) })

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 bg-slate-950 min-h-[calc(100vh-4rem)] px-6 py-8 lg:px-10">
      <Link
        href="/dashboard/agenda"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft size={14} /> Volver a Agenda
      </Link>
      <AgendaReadOnlyView eventos={eventos} />
    </div>
  )
}
