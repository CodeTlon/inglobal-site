import { getSiteSettings } from '@/lib/content'
import { updateSiteSettings } from '@/app/actions/settings'
import PageHeader from '@/components/dashboard/PageHeader'
import SaveButton from '@/components/dashboard/SaveButton'
import HeroForm from './HeroForm'

export default async function HeroContentPage() {
  const settings = await getSiteSettings('hero')
  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Hero"
        description="Encabezado principal del sitio. El video (si está configurado) reemplaza la imagen estática."
      />
      <HeroForm settings={settings} />
    </div>
  )
}
