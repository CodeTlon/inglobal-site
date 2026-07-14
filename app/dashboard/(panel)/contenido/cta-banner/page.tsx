import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import CtaBannerForm from './CtaBannerForm'

export default async function CtaBannerContentPage() {
  const settings = await getSiteSettings('cta_banner')
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={14} /> Volver al panel
        </Link>
      </div>
      <PageHeader
        title="CTA Banner"
        description="Bloque oscuro con imagen de fondo y llamada a la acción entre los servicios y la galería."
      />
      <CtaBannerForm settings={settings} />
    </div>
  )
}
