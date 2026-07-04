import Link from 'next/link'
import { createCliente } from '@/app/actions/clientes'
import PageHeader from '@/components/dashboard/PageHeader'
import ClienteForm from '../ClienteForm'
import { ArrowLeft } from 'lucide-react'

export default function NuevoClientePage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/dashboard/clientes"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={14} /> Volver a Clientes
        </Link>
      </div>

      <PageHeader title="Nuevo Cliente" description="Registrá una empresa cliente para mostrar en el sitio." />

      <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
        <ClienteForm action={createCliente} successMessage="Cliente creado correctamente." />
      </div>
    </div>
  )
}
