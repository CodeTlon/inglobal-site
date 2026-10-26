import Image from 'next/image'
import Picture from '@/components/Picture'
import Link from 'next/link'
import PaginationLinks from '@/components/PaginationLinks'
import { paginar } from '@/lib/paginacion'
import type { Montaje } from '@/lib/content'

const PER_PAGE = 8

export const MONTAJES_POR_PAGINA = PER_PAGE

export default function MontajesGrid({ montajes, page, basePath }: { montajes: Montaje[]; page: number; basePath: string }) {
  const { items: paginated, pagina, totalPaginas } = paginar(montajes, page, PER_PAGE)

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
        {paginated.map((montaje) => {
          const isRemoteImg = montaje.cover_image?.startsWith('http')
          return (
            <Link
              key={montaje.slug}
              href={`/montajes/${montaje.slug}`}
              className="group flex flex-col h-full"
              data-animate="fade-up"
            >
              {/* Image */}
              <div className="relative overflow-hidden rounded-2xl bg-zinc-100 aspect-16/10 mb-8">
                {montaje.cover_image ? (
                  isRemoteImg ? (
                    <Image
                      src={montaje.cover_image}
                      alt={montaje.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  ) : (
                    <Picture
                      src={montaje.cover_image}
                      alt={montaje.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  )
                ) : (
                  <div className="w-full h-full bg-zinc-200" />
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col grow">
                <h2 className="text-2xl font-headline font-bold text-zinc-900 mb-4 tracking-tight group-hover:text-igb-yellow-dark transition-colors duration-300">
                  {montaje.title}
                </h2>
                <p className="text-zinc-500 text-lg leading-relaxed mb-8">
                  {montaje.excerpt}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      <PaginationLinks
        page={pagina}
        totalPages={totalPaginas}
        href={(n) => (n === 1 ? basePath : `${basePath}?pagina=${n}`)}
        label="Páginas"
      />
    </div>
  )
}
