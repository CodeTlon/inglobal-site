import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import UbicacionForm from './UbicacionForm'

export default async function UbicacionContentPage() {
  const settings = await getSiteSettings('ubicacion')
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={14} /> Volver al panel
        </Link>
      </div>
      <PageHeader
        title="Sección Ubicación"
        description="Texto que acompaña el mapa de Google Maps en el home y en contacto."
      />
      <UbicacionForm settings={settings} />
    </div>
  )
}
