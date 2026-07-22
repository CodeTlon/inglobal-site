import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import StatsForm from './StatsForm'

export default async function StatsContentPage() {
  const settings = await getSiteSettings('stats')
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={14} /> Volver al panel
        </Link>
      </div>
      <PageHeader
        title="Stats del Hero"
        description="Los 3 indicadores clave que aparecen en la parte inferior del hero."
      />
      <StatsForm settings={settings} />
    </div>
  )
}
