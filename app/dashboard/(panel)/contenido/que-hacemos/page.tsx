import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import QueHacemosForm from './QueHacemosForm'

export default async function QueHacemosContentPage() {
  const settings = await getSiteSettings('que_hacemos')
  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Qué Hacemos"
        description="Encabezado de la sección de servicios en el home. Las cards de servicios se editan en Servicios."
      />
      <QueHacemosForm settings={settings} />
    </div>
  )
}
