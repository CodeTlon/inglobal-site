import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import GaleriaHeaderForm from './GaleriaHeaderForm'

export default async function GaleriaHeaderContentPage() {
  const settings = await getSiteSettings('galeria_header')
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={14} /> Volver al panel
        </Link>
      </div>
      <PageHeader
        title="Galería — Encabezado"
        description="Textos del encabezado y el CTA final de la página de Galería. Las fotos se editan en Galería."
      />
      <GaleriaHeaderForm settings={settings} />
    </div>
  )
}
