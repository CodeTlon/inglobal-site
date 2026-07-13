import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import AccesosRapidosForm from './AccesosRapidosForm'

export default async function AccesosRapidosContentPage() {
  const settings = await getSiteSettings('dashboard_quicklinks')
  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Accesos rápidos"
        description="Los links que aparecen como cards en el inicio del panel."
      />
      <AccesosRapidosForm settings={settings} />
    </div>
  )
}
