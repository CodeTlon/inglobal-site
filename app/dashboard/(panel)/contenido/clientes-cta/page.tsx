import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import ClientesCtaForm from './ClientesCtaForm'

export default async function ClientesCtaContentPage() {
  const settings = await getSiteSettings('clientes_cta')
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={14} /> Volver al panel
        </Link>
      </div>
      <PageHeader
        title="Clientes — CTA final"
        description="Texto del bloque de llamado a la acción al final de la página de Clientes. El encabezado de esa página se edita en Clientes (sección home)."
      />
      <ClientesCtaForm settings={settings} />
    </div>
  )
}
