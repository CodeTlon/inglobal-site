import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import QuienesSomosForm from './QuienesSomosForm'

export default async function QuienesSomosContentPage() {
  const settings = await getSiteSettings('quienes_somos')
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={14} /> Volver al panel
        </Link>
      </div>
      <PageHeader
        title="Quiénes Somos"
        description="Contenido de la página /quienes-somos e imagen principal."
      />
      <QuienesSomosForm settings={settings} />
    </div>
  )
}
