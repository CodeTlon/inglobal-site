import Image from 'next/image'
import Link from 'next/link'
import PaginationLinks from '@/components/PaginationLinks'
import { paginar } from '@/lib/paginacion'
import type { Cliente } from '@/lib/content'

const PER_PAGE = 20

const cardClass =
  'w-[calc(50%-0.75rem)] sm:w-[calc(33.333%-1rem)] md:w-[calc(25%-1.125rem)] lg:w-[calc(20%-1.2rem)] bg-white rounded-xl p-6 flex items-center justify-center shadow-xs border border-zinc-100 aspect-3/2 cursor-pointer hover:-translate-y-1 transition-all duration-300'

function ClienteCard({ cliente }: { cliente: Cliente }) {
  return (
    <Link href={`/clientes/${cliente.slug}`} className={cardClass}>
      <Image
        src={cliente.logo}
        alt={`Logo ${cliente.name}`}
        width={140}
        height={70}
        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 18vw"
        quality={70}
        loading="lazy"
        className="object-contain max-h-12 w-auto"
      />
    </Link>
  )
}

export const CLIENTES_POR_PAGINA = PER_PAGE

export default function ClientesGrid({ clientes, page, basePath }: { clientes: Cliente[]; page: number; basePath: string }) {
  if (clientes.length === 0) return null

  const { items: paginated, pagina, totalPaginas } = paginar(clientes, page, PER_PAGE)

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-6">
        {paginated.map((cliente) => (
          <ClienteCard key={cliente.slug} cliente={cliente} />
        ))}
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
