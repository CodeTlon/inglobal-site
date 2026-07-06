import Link from 'next/link'
import Image from 'next/image'
import { getGaleria } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import { Plus } from 'lucide-react'

export default async function GaleriaDashboardPage() {
  const items = await getGaleria({ includeUnpublished: true })

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Galería"
        description={`${items.length} imágenes en el portafolio operativo.`}
        actions={
          <Link
            href="/dashboard/galeria/nuevo"
            className="inline-flex items-center gap-2 bg-igb-yellow text-igb-on-yellow px-4 py-2.5 rounded-md font-headline font-bold text-sm hover:brightness-95 transition-all"
          >
            <Plus size={16} /> Nueva imagen
          </Link>
        }
      />

      <div className="space-y-3">
        {items.map((item) => {
          const isRemote = item.imagen.startsWith('http')
          return (
            <Link
              key={item.id}
              href={`/dashboard/galeria/${item.id}`}
              className="flex items-center gap-4 bg-white rounded-xl p-4 border border-zinc-200 shadow-sm hover:shadow-igb hover:border-igb-yellow/40 transition-all group"
            >
              <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-100 relative">
                <Image
                  src={isRemote ? item.imagen : `/images/opt/${item.imagen}-md.webp`}
                  alt={item.alt}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-headline font-bold text-zinc-900 text-sm truncate">{item.alt}</p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Mobile {item.col_span_mobile}×{item.row_span_mobile} · Desktop {item.col_span_desktop}×{item.row_span_desktop}
                  {!item.published && ' · Sin publicar'}
                </p>
              </div>
            </Link>
          )
        })}

        {items.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
            <p className="text-zinc-400 text-sm">No hay imágenes aún.</p>
            <Link
              href="/dashboard/galeria/nuevo"
              className="inline-flex items-center gap-2 mt-4 text-igb-yellow-dark font-bold text-sm hover:underline"
            >
              <Plus size={14} /> Subir la primera
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
