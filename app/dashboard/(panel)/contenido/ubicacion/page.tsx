import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import UbicacionForm from './UbicacionForm'

export default async function UbicacionContentPage() {
  const settings = await getSiteSettings('ubicacion')
  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Sección Ubicación"
        description="Texto que acompaña el mapa de Google Maps en el home y en contacto."
      />
      <UbicacionForm settings={settings} />
    </div>
  )
}
