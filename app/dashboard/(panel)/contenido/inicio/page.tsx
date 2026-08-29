import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import ContentTabs from '@/components/dashboard/ContentTabs'
import HeroForm from '../hero/HeroForm'
import QueHacemosForm from '../que-hacemos/QueHacemosForm'
import StatsForm from '../stats/StatsForm'
import ClientesDestForm from '../clientes-destacados/ClientesDestForm'
import HomeGalleryForm from '../home-gallery/HomeGalleryForm'
import CtaBannerForm from '../cta-banner/CtaBannerForm'
import AccesosRapidosForm from '../accesos-rapidos/AccesosRapidosForm'
import UbicacionForm from '../ubicacion/UbicacionForm'

export default async function InicioContentPage() {
  const [hero, queHacemos, stats, clientesDest, homeGallery, ctaBanner, accesosRapidos, ubicacion] = await Promise.all([
    getSiteSettings('hero'),
    getSiteSettings('que_hacemos'),
    getSiteSettings('stats'),
    getSiteSettings('clientes_destacados'),
    getSiteSettings('home_gallery'),
    getSiteSettings('cta_banner'),
    getSiteSettings('dashboard_quicklinks'),
    getSiteSettings('ubicacion'),
  ])
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={14} /> Volver al panel
        </Link>
      </div>
      <PageHeader title="Página de Inicio" description="Elegí qué bloque de la home querés editar." />
      <ContentTabs
        tabs={[
          { label: 'Hero', content: <HeroForm settings={hero} /> },
          { label: 'Qué hacemos', content: <QueHacemosForm settings={queHacemos} /> },
          { label: 'Stats', content: <StatsForm settings={stats} /> },
          { label: 'Clientes destacados', content: <ClientesDestForm settings={clientesDest} /> },
          { label: 'Galería de fotos', content: <HomeGalleryForm settings={homeGallery} /> },
          { label: 'CTA Banner', content: <CtaBannerForm settings={ctaBanner} /> },
          { label: 'Accesos rápidos', content: <AccesosRapidosForm settings={accesosRapidos} /> },
          { label: 'Ubicación', content: <UbicacionForm settings={ubicacion} /> },
        ]}
      />
    </div>
  )
}
