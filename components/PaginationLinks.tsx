import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Paginación por enlaces (`?pagina=N`) para páginas de servidor: la página vive en la URL, se comparte,
 * funciona sin JavaScript y los buscadores la pueden seguir. `href(n)` arma la URL de la página n.
 */
export default function PaginationLinks({
  page,
  totalPages,
  href,
  label = 'Paginación',
}: {
  page: number
  totalPages: number
  href: (page: number) => string
  label?: string
}) {
  if (totalPages <= 1) return null
  const clase =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-igb-navy'
  const inactivo = `${clase} border-zinc-200 bg-white text-zinc-700 hover:border-igb-yellow-dark/40 hover:bg-zinc-50`
  const desde = Math.max(1, Math.min(page - 2, totalPages - 4))
  const hasta = Math.min(totalPages, desde + 4)
  const paginas = Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i)

  return (
    <nav aria-label={label} className="mt-10 flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" aria-label="Página anterior" className={inactivo}>
          <ChevronLeft size={16} />
        </Link>
      ) : (
        <span aria-hidden className={`${clase} cursor-not-allowed border-zinc-100 text-zinc-300`}><ChevronLeft size={16} /></span>
      )}
      {paginas.map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === page ? 'page' : undefined}
          aria-label={`Página ${n}`}
          className={n === page ? `${clase} border-igb-navy bg-igb-navy text-white` : inactivo}
        >
          {n}
        </Link>
      ))}
      {page < totalPages ? (
        <Link href={href(page + 1)} rel="next" aria-label="Página siguiente" className={inactivo}>
          <ChevronRight size={16} />
        </Link>
      ) : (
        <span aria-hidden className={`${clase} cursor-not-allowed border-zinc-100 text-zinc-300`}><ChevronRight size={16} /></span>
      )}
    </nav>
  )
}
