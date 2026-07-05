import Link from 'next/link'
import Image from 'next/image'
import { getMontajes } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import { ChevronRight, Plus } from 'lucide-react'

export default async function MontajesDashboardPage() {
  const montajes = await getMontajes({ includeUnpublished: true })

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Montajes"
        description={`${montajes.length} casos de éxito publicados.`}
        actions={
          <Link
            href="/dashboard/montajes/nuevo"
            className="inline-flex items-center gap-2 bg-igb-yellow text-igb-on-yellow px-4 py-2.5 rounded-md font-headline font-bold text-sm hover:brightness-95 transition-all"
          >
            <Plus size={16} /> Nuevo montaje
          </Link>
        }
      />

      <div className="space-y-3">
        {montajes.map((m) => (
          <Link
            key={m.slug}
            href={`/dashboard/montajes/${m.slug}`}
            className="flex items-center gap-4 bg-white rounded-xl p-4 border border-zinc-200 shadow-sm hover:shadow-igb hover:border-igb-yellow/40 transition-all group"
          >
            {/* Cover thumbnail */}
            <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-100">
              {m.cover_image ? (
                <Image
                  src={m.cover_image.startsWith('http') ? m.cover_image : `/images/opt/${m.cover_image.replace(/^.*\//, '').replace(/\.[^.]+$/, '')}-md.webp`}
                  alt={m.title}
                  width={64}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-zinc-200" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-headline font-bold text-zinc-900 text-sm">{m.title}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {m.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold text-zinc-400 border border-zinc-200 px-2 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <ChevronRight
              size={16}
              className="text-zinc-300 group-hover:text-igb-yellow-dark group-hover:translate-x-1 transition-all flex-shrink-0"
            />
          </Link>
        ))}

        {montajes.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
            <p className="text-zinc-400 text-sm">No hay montajes aún.</p>
            <Link
              href="/dashboard/montajes/nuevo"
              className="inline-flex items-center gap-2 mt-4 text-igb-yellow-dark font-bold text-sm hover:underline"
            >
              <Plus size={14} /> Crear el primero
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
