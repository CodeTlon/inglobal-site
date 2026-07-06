import Link from 'next/link'
import { createGaleriaItem } from '@/app/actions/galeria'
import PageHeader from '@/components/dashboard/PageHeader'
import GaleriaForm from '../GaleriaForm'
import { ArrowLeft } from 'lucide-react'

export default function NuevaImagenGaleriaPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/dashboard/galeria"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={14} /> Volver a Galería
        </Link>
      </div>

      <PageHeader title="Nueva imagen" description="Subí una foto y definí cuánto espacio ocupa en la grilla." />

      <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
        <GaleriaForm action={createGaleriaItem} successMessage="Imagen creada correctamente." />
      </div>
    </div>
  )
}
