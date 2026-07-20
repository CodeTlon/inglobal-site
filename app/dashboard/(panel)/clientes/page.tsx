import Link from 'next/link'
import Image from 'next/image'
import { getClientes } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import { ChevronRight, Plus } from 'lucide-react'

export default async function ClientesDashboardPage() {
  const clientes = await getClientes({ includeUnpublished: true })

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Clientes"
        description={`${clientes.length} clientes registrados. Ordenados por work_rank DESC.`}
        actions={
          <Link
            href="/dashboard/clientes/nuevo"
            className="inline-flex items-center gap-2 bg-igb-yellow text-igb-on-yellow px-4 py-2.5 rounded-md font-headline font-bold text-sm hover:brightness-95 transition-all"
          >
            <Plus size={16} /> Nuevo cliente
          </Link>
        }
      />

      <div className="space-y-3">
        {clientes.map((c) => (
          <Link
            key={c.slug}
            href={`/dashboard/clientes/${c.slug}`}
            prefetch={false}
            className="flex items-center gap-4 bg-white rounded-xl p-4 border border-zinc-200 shadow-sm hover:shadow-igb hover:border-igb-yellow/40 transition-all group"
          >
            {/* Logo */}
            <div className="w-16 h-10 flex-shrink-0 flex items-center justify-center bg-zinc-50 rounded border border-zinc-100">
              {c.logo ? (
                <Image
                  src={c.logo}
                  alt={`Logo ${c.name}`}
                  width={60}
                  height={36}
                  className="max-h-8 w-auto object-contain"
                />
              ) : (
                <div className="w-8 h-8 bg-zinc-200 rounded" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-headline font-bold text-zinc-900 text-sm">{c.name}</p>
              {c.bio && (
                <p className="text-xs text-zinc-500 truncate mt-0.5">{c.bio}</p>
              )}
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="hidden sm:inline text-xs font-bold text-zinc-400 bg-zinc-50 px-2 py-1 rounded">
                rank {c.work_rank}
              </span>
              <ChevronRight
                size={16}
                className="text-zinc-300 group-hover:text-igb-yellow-dark group-hover:translate-x-1 transition-all"
              />
            </div>
          </Link>
        ))}

        {clientes.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
            <p className="text-zinc-400 text-sm">No hay clientes registrados aún.</p>
            <Link
              href="/dashboard/clientes/nuevo"
              className="inline-flex items-center gap-2 mt-4 text-igb-yellow-dark font-bold text-sm hover:underline"
            >
              <Plus size={14} /> Agregar el primero
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
