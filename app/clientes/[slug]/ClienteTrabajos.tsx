'use client'

// Lista paginada de trabajos de un cliente. Patrón simplificado de
// gc2/src/app/(public)/blog/BlogList.tsx (sin búsqueda/categorías/sidebar).

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PlayCircle } from 'lucide-react'
import { parseYoutubeId } from '@/lib/youtube'
import type { Trabajo } from '@/lib/content'
import Pagination from '@/components/Pagination'

const PER_PAGE = 6

export default function ClienteTrabajos({ clienteSlug, trabajos }: { clienteSlug: string; trabajos: Trabajo[] }) {
  const [page, setPage] = useState(1)

  const totalPages = Math.ceil(trabajos.length / PER_PAGE)
  const paginated = trabajos.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-6">
        {paginated.map((t) => {
          const ytId = parseYoutubeId(t.youtube_url)
          const thumb = t.cover_image ?? (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null)

          return (
            <Link
              key={t.id}
              href={`/clientes/${clienteSlug}/${t.slug}`}
              className="group rounded-xl overflow-hidden border border-zinc-200 bg-white shadow-sm hover:shadow-igb hover:-translate-y-0.5 transition-all"
            >
              <div className="relative w-full aspect-video bg-zinc-100 overflow-hidden">
                {thumb ? (
                  <Image
                    src={thumb}
                    alt={t.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-100" />
                )}
                {ytId && !t.cover_image && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <PlayCircle size={36} className="text-white" />
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-headline font-bold text-zinc-900 text-lg leading-snug mb-2 line-clamp-2">
                  {t.title}
                </h3>
                {t.excerpt && (
                  <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">{t.excerpt}</p>
                )}
                <span className="inline-block mt-3 text-igb-yellow-dark text-xs font-bold uppercase tracking-widest group-hover:tracking-[3px] transition-all">
                  Ver trabajo →
                </span>
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
