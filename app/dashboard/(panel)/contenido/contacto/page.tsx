import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import ContentSection from '@/components/dashboard/ContentSection'
import ContactoHeaderForm from '../contacto-header/ContactoHeaderForm'
import ContactoForm from './ContactoForm'

export default async function ContactoContentPage() {
  const [contactoHeader, contacto] = await Promise.all([
    getSiteSettings('contacto_header'),
    getSiteSettings('contacto'),
  ])
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={14} /> Volver al panel
        </Link>
      </div>
      <PageHeader title="Contacto" description="Encabezado y datos de contacto de la página de Contacto, en un solo lugar." />
      <ContentSection titulo="Encabezado">
        <ContactoHeaderForm settings={contactoHeader} />
      </ContentSection>
      <ContentSection titulo="Datos de contacto">
        <ContactoForm settings={contacto} />
      </ContentSection>
    </div>
  )
}
