import Link from 'next/link'
import Image from 'next/image'
import { getServicios } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import { ChevronRight, ArrowUpToLine, HardHat, Move, Truck, Plus, type LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = { ArrowUpToLine, HardHat, Move, Truck }

export default async function ServiciosDashboardPage() {
  const servicios = await getServicios({ includeUnpublished: true })

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Servicios"
        description="Hacé clic en uno para editar su contenido e imagen."
        actions={
          <Link
            href="/dashboard/servicios/nuevo"
            className="inline-flex items-center gap-2 bg-igb-yellow text-igb-on-yellow px-4 py-2.5 rounded-md font-headline font-bold text-sm hover:brightness-95 transition-all"
          >
            <Plus size={16} /> Nuevo servicio
          </Link>
        }
      />

      <div className="space-y-3">
        {servicios.map((s) => {
          const Icon = ICON_MAP[s.icon] ?? ArrowUpToLine
          const isRemote = s.img?.startsWith('http') || s.img?.startsWith('/')
          return (
            <Link
              key={s.slug}
              href={`/dashboard/servicios/${s.slug}`}
              prefetch={false}
              className="flex items-center gap-4 bg-white rounded-xl p-4 border border-zinc-200 shadow-sm hover:shadow-igb hover:border-igb-yellow/40 transition-all group"
            >
              {/* Image or icon */}
              <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-100 flex items-center justify-center">
                {s.img ? (
                  <Image
                    src={isRemote ? s.img : `/images/opt/${s.img.replace(/^.*\//, '').replace(/\.[^.]+$/, '')}-md.webp`}
                    alt={s.title}
                    width={64}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Icon size={20} className="text-zinc-300" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-headline font-bold text-zinc-900 text-sm">{s.title}</p>
                <p className="text-xs text-zinc-500 truncate mt-0.5">{s.desc}</p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="hidden sm:inline text-xs font-bold text-zinc-400 bg-zinc-50 px-2 py-1 rounded">
                  Orden {s.display_order}
                </span>
                <ChevronRight
                  size={16}
                  className="text-zinc-300 group-hover:text-igb-yellow-dark group-hover:translate-x-1 transition-all"
                />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
