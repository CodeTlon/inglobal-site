import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import ContentSection from '@/components/dashboard/ContentSection'
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
      <PageHeader title="Inicio" description="Todo el contenido editable de la página de inicio, en un solo lugar." />
      <ContentSection titulo="Hero">
        <HeroForm settings={hero} />
      </ContentSection>
      <ContentSection titulo="Qué hacemos">
        <QueHacemosForm settings={queHacemos} />
      </ContentSection>
      <ContentSection titulo="Stats">
        <StatsForm settings={stats} />
      </ContentSection>
      <ContentSection titulo="Clientes destacados">
        <ClientesDestForm settings={clientesDest} />
      </ContentSection>
      <ContentSection titulo="Galería de fotos">
        <HomeGalleryForm settings={homeGallery} />
      </ContentSection>
      <ContentSection titulo="CTA Banner">
        <CtaBannerForm settings={ctaBanner} />
      </ContentSection>
      <ContentSection titulo="Accesos rápidos">
        <AccesosRapidosForm settings={accesosRapidos} />
      </ContentSection>
      <ContentSection titulo="Ubicación">
        <UbicacionForm settings={ubicacion} />
      </ContentSection>
    </div>
  )
}
