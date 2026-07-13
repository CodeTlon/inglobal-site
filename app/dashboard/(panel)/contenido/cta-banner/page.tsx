import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import CtaBannerForm from './CtaBannerForm'

export default async function CtaBannerContentPage() {
  const settings = await getSiteSettings('cta_banner')
  return (
    <div className="max-w-4xl">
      <PageHeader
        title="CTA Banner"
        description="Bloque oscuro con imagen de fondo y llamada a la acción entre los servicios y la galería."
      />
      <CtaBannerForm settings={settings} />
    </div>
  )
}
