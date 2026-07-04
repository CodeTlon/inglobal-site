import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import StatsForm from './StatsForm'

export default async function StatsContentPage() {
  const settings = await getSiteSettings('stats')
  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Stats del Hero"
        description="Los 3 indicadores clave que aparecen en la parte inferior del hero."
      />
      <StatsForm settings={settings} />
    </div>
  )
}
