import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import ContentTabs from '@/components/dashboard/ContentTabs'
import QuienesSomosForm from '../quienes-somos/QuienesSomosForm'
import ServiciosHeaderForm from '../servicios-header/ServiciosHeaderForm'
import MontajesHeaderForm from '../montajes-header/MontajesHeaderForm'
import GaleriaHeaderForm from '../galeria-header/GaleriaHeaderForm'

export default async function PaginasContentPage() {
  const [quienesSomos, serviciosHeader, montajesHeader, galeriaHeader] = await Promise.all([
    getSiteSettings('quienes_somos'),
    getSiteSettings('servicios_header'),
    getSiteSettings('montajes_header'),
    getSiteSettings('galeria_header'),
  ])
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={14} /> Volver al panel
        </Link>
      </div>
      <PageHeader title="Páginas" description="Quiénes somos, y los encabezados de Servicios, Montajes y Galería." />
      <ContentTabs
        tabs={[
          { label: 'Quiénes somos', content: <QuienesSomosForm settings={quienesSomos} /> },
          { label: 'Servicios (encabezado)', content: <ServiciosHeaderForm settings={serviciosHeader} /> },
          { label: 'Montajes (encabezado)', content: <MontajesHeaderForm settings={montajesHeader} /> },
          { label: 'Galería (encabezado)', content: <GaleriaHeaderForm settings={galeriaHeader} /> },
        ]}
      />
    </div>
  )
}
