'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Pagination from '@/components/Pagination'
import type { Cliente } from '@/lib/content'

const PER_PAGE = 20

export default function ClientesGrid({ clientes }: { clientes: Cliente[] }) {
  const [page, setPage] = useState(1)

  const totalPages = Math.ceil(clientes.length / PER_PAGE)
  const paginated = clientes.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-6">
        {paginated.map((cliente) => (
          <Link
            key={cliente.slug}
            href={`/clientes/${cliente.slug}`}
            className="w-[calc(50%-0.75rem)] sm:w-[calc(33.333%-1rem)] md:w-[calc(25%-1.125rem)] lg:w-[calc(20%-1.2rem)] bg-white rounded-xl p-6 flex items-center justify-center shadow-sm border border-zinc-100 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:-translate-y-1 transition-all duration-300 aspect-[3/2]"
          >
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
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={(p) => {
          setPage(p)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      />
    </div>
  )
}
