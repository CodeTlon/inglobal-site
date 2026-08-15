import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import FooterExtraForm from './FooterExtraForm'

export default async function FooterExtraContentPage() {
  const settings = await getSiteSettings('footer_extra')
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={14} /> Volver al panel
        </Link>
      </div>
      <PageHeader
        title="Footer — Textos extra"
        description="Encabezados de columna, links legales y el nombre de la empresa en el copyright. Descripción, teléfono, dirección, email y horario se editan en Footer."
      />
      <FooterExtraForm settings={settings} />
    </div>
  )
}
