import Link from 'next/link'
import { createServicio } from '@/app/actions/servicios'
import PageHeader from '@/components/dashboard/PageHeader'
import ServicioForm from '../ServicioForm'
import { ArrowLeft } from 'lucide-react'

export default function NuevoServicioPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link
          href="/dashboard/servicios"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={14} /> Volver a Servicios
        </Link>
      </div>

      <PageHeader title="Nuevo servicio" description="Completá los campos para publicar un nuevo servicio." />

      <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
        <ServicioForm action={createServicio} />
      </div>
    </div>
  )
}
