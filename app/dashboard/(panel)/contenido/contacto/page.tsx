import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import ContactoForm from './ContactoForm'

export default async function ContactoContentPage() {
  const settings = await getSiteSettings('contacto')
  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Página de Contacto"
        description="Datos que aparecen en la columna de información de la página de contacto."
      />
      <ContactoForm settings={settings} />
    </div>
  )
}
