import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import ServiciosHeaderForm from './ServiciosHeaderForm'

export default async function ServiciosHeaderContentPage() {
  const settings = await getSiteSettings('servicios_header')
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={14} /> Volver al panel
        </Link>
      </div>
      <PageHeader
        title="Servicios — Encabezado"
        description="Textos del encabezado y el CTA final de la página de Servicios. Las cards de cada servicio se editan en Servicios."
      />
      <ServiciosHeaderForm settings={settings} />
    </div>
  )
}
