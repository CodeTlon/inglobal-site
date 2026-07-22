import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import AccesosRapidosForm from './AccesosRapidosForm'

export default async function AccesosRapidosContentPage() {
  const settings = await getSiteSettings('dashboard_quicklinks')
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={14} /> Volver al panel
        </Link>
      </div>
      <PageHeader
        title="Accesos rápidos"
        description="Los links que aparecen como cards en el inicio del panel."
      />
      <AccesosRapidosForm settings={settings} />
    </div>
  )
}
