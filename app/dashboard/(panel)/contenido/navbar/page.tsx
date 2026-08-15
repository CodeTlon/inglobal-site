import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import NavbarForm from './NavbarForm'

export default async function NavbarContentPage() {
  const settings = await getSiteSettings('navbar')
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={14} /> Volver al panel
        </Link>
      </div>
      <PageHeader
        title="Menú de navegación"
        description="Texto de los links del menú (arriba en todo el sitio) y del footer, que muestra los mismos 7 links. Las rutas quedan fijas, solo se edita el texto visible."
      />
      <NavbarForm settings={settings} />
    </div>
  )
}
