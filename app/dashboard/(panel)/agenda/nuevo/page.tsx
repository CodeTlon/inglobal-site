import Link from 'next/link'
import { createEvento } from '@/app/actions/agenda'
import { getGruas, getEmpresasAgenda, getOperarios } from '@/lib/agenda'
import PageHeader from '@/components/dashboard/PageHeader'
import EventoForm from '../EventoForm'
import { ArrowLeft } from 'lucide-react'

export default async function NuevoEventoPage() {
  const [gruas, empresas, operarios] = await Promise.all([
    getGruas(),
    getEmpresasAgenda(),
    getOperarios(),
  ])

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link
          href="/dashboard/agenda"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={14} /> Volver a Agenda
        </Link>
      </div>

      <PageHeader title="Nuevo Evento" description="Programá una grúa para una empresa en un horario y ubicación." />

      <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
        <EventoForm gruas={gruas} empresas={empresas} operarios={operarios} action={createEvento} />
      </div>
    </div>
  )
}
