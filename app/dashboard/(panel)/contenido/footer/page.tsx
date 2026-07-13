import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import FooterForm from './FooterForm'

export default async function FooterContentPage() {
  const settings = await getSiteSettings('footer')
  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Footer"
        description="Datos de contacto que aparecen en el pie de página."
      />
      <FooterForm settings={settings} />
    </div>
  )
}
