import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import MontajesHeaderForm from './MontajesHeaderForm'

export default async function MontajesHeaderContentPage() {
  const settings = await getSiteSettings('montajes_header')
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={14} /> Volver al panel
        </Link>
      </div>
      <PageHeader
        title="Montajes — Encabezado"
        description="Textos del encabezado y el CTA final de la página de Montajes. Los proyectos se editan en Montajes."
      />
      <MontajesHeaderForm settings={settings} />
    </div>
  )
}
