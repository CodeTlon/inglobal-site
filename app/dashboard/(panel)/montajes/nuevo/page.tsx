import Link from 'next/link'
import { createMontaje } from '@/app/actions/montajes'
import PageHeader from '@/components/dashboard/PageHeader'
import MontajeForm from '../MontajeForm'
import { ArrowLeft } from 'lucide-react'

export default function NuevoMontajePage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/dashboard/montajes"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={14} /> Volver a Montajes
        </Link>
      </div>

      <PageHeader title="Nuevo Montaje" description="Completá los campos para publicar un nuevo caso de éxito." />

      <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
        <MontajeForm action={createMontaje} successMessage="Montaje creado correctamente." />
      </div>
    </div>
  )
}
