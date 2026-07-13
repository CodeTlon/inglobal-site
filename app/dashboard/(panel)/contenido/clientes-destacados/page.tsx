import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import ClientesDestForm from './ClientesDestForm'

export default async function ClientesDestContentPage() {
  const settings = await getSiteSettings('clientes_destacados')
  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Sección Clientes (Home)"
        description="Encabezado de la sección de logos de clientes en el home. Los logos se gestionan en Clientes."
      />
      <ClientesDestForm settings={settings} />
    </div>
  )
}
