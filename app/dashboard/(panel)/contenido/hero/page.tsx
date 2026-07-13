import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import HeroForm from './HeroForm'

export default async function HeroContentPage() {
  const settings = await getSiteSettings('hero')
  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Hero"
        description="Encabezado principal del sitio. El video (si está configurado) reemplaza la imagen estática."
      />
      <HeroForm settings={settings} />
    </div>
  )
}
