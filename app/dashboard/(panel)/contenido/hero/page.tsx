import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import HeroForm from './HeroForm'

export default async function HeroContentPage() {
  const settings = await getSiteSettings('hero')
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={14} /> Volver al panel
        </Link>
      </div>
      <PageHeader
        title="Hero"
        description="Encabezado principal del sitio. El video (si está configurado) reemplaza la imagen estática."
      />
      <HeroForm settings={settings} />
    </div>
  )
}
