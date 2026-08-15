import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import HomeGalleryForm from './HomeGalleryForm'

export default async function HomeGalleryContentPage() {
  const settings = await getSiteSettings('home_gallery')
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={14} /> Volver al panel
        </Link>
      </div>
      <PageHeader
        title="Home — Galería de fotos"
        description="Sección 'Nuestro Trabajo' del home: encabezado y las 5 fotos del mosaico. La cantidad de fotos y su tamaño en el mosaico quedan fijos — solo se edita cada imagen y su texto."
      />
      <HomeGalleryForm settings={settings} />
    </div>
  )
}
