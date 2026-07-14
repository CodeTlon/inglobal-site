import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import ClientesDestForm from './ClientesDestForm'

export default async function ClientesDestContentPage() {
  const settings = await getSiteSettings('clientes_destacados')
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={14} /> Volver al panel
        </Link>
      </div>
      <PageHeader
        title="Sección Clientes (Home)"
        description="Encabezado de la sección de logos de clientes en el home. Los logos se gestionan en Clientes."
      />
      <ClientesDestForm settings={settings} />
    </div>
  )
}
