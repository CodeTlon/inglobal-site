import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import ContactoForm from './ContactoForm'

export default async function ContactoContentPage() {
  const settings = await getSiteSettings('contacto')
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={14} /> Volver al panel
        </Link>
      </div>
      <PageHeader
        title="Página de Contacto"
        description="Datos que aparecen en la columna de información de la página de contacto."
      />
      <ContactoForm settings={settings} />
    </div>
  )
}
