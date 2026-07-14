import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import QueHacemosForm from './QueHacemosForm'

export default async function QueHacemosContentPage() {
  const settings = await getSiteSettings('que_hacemos')
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={14} /> Volver al panel
        </Link>
      </div>
      <PageHeader
        title="Qué Hacemos"
        description="Encabezado de la sección de servicios en el home. Las cards de servicios se editan en Servicios."
      />
      <QueHacemosForm settings={settings} />
    </div>
  )
}
