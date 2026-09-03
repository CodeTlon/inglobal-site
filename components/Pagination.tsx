'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  if (totalPages <= 1) return null
  const pages = buildPages(page, totalPages)

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Página anterior"
        className="w-9 h-9 rounded-lg flex items-center justify-center border border-zinc-200 bg-white transition-all hover:border-igb-yellow-dark/40 hover:bg-zinc-50 active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-igb-yellow disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-zinc-200 disabled:hover:bg-white disabled:active:scale-100"
      >
        <ChevronLeft size={16} className="text-zinc-500" />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-zinc-300 text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            aria-label={`Ir a la página ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all border active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-igb-yellow ${
              p === page
                ? 'bg-igb-yellow border-igb-yellow text-igb-on-yellow'
                : 'bg-white border-zinc-200 text-zinc-500 hover:border-igb-yellow-dark/40 hover:text-igb-yellow-dark'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Página siguiente"
        className="w-9 h-9 rounded-lg flex items-center justify-center border border-zinc-200 bg-white transition-all hover:border-igb-yellow-dark/40 hover:bg-zinc-50 active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-igb-yellow disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-zinc-200 disabled:hover:bg-white disabled:active:scale-100"
      >
        <ChevronRight size={16} className="text-zinc-500" />
      </button>
    </div>
  )
}

function buildPages(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}
