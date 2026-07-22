'use client'

import { useState } from 'react'
import Image from 'next/image'
import Picture from '@/components/Picture'
import Link from 'next/link'
import Pagination from '@/components/Pagination'
import type { Montaje } from '@/lib/content'

const PER_PAGE = 8

export default function MontajesGrid({ montajes }: { montajes: Montaje[] }) {
  const [page, setPage] = useState(1)

  const totalPages = Math.ceil(montajes.length / PER_PAGE)
  const paginated = montajes.slice((page - 1) * PER_PAGE, page * PER_PAGE)

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
              <div className="relative overflow-hidden rounded-2xl bg-zinc-100 aspect-[16/10] mb-8">
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
              <div className="flex flex-col flex-grow">
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
