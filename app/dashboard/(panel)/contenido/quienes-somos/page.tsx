import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import QuienesSomosForm from './QuienesSomosForm'

export default async function QuienesSomosContentPage() {
  const settings = await getSiteSettings('quienes_somos')
  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Quiénes Somos"
        description="Contenido de la página /quienes-somos e imagen principal."
      />
      <QuienesSomosForm settings={settings} />
    </div>
  )
}
