import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import ContactoHeaderForm from './ContactoHeaderForm'

export default async function ContactoHeaderContentPage() {
  const settings = await getSiteSettings('contacto_header')
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={14} /> Volver al panel
        </Link>
      </div>
      <PageHeader
        title="Contacto — Encabezado"
        description="Textos de la página de Contacto y los links de WhatsApp/Instagram. Dirección, horarios, teléfono y email se editan en Contacto."
      />
      <ContactoHeaderForm settings={settings} />
    </div>
  )
}
