import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import FooterForm from './FooterForm'

export default async function FooterContentPage() {
  const settings = await getSiteSettings('footer')
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={14} /> Volver al panel
        </Link>
      </div>
      <PageHeader
        title="Footer"
        description="Datos de contacto que aparecen en el pie de página."
      />
      <FooterForm settings={settings} />
    </div>
  )
}
