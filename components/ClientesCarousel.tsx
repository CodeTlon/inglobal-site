'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Cliente } from '@/lib/content'

// ponytail: si entran todos en una pantalla no hace falta scroll-snap ni flechas
const VISIBLE_ON_SCREEN = 5

const cardClass =
  'bg-white rounded-xl p-6 flex items-center justify-center h-28 border border-slate-100 shadow-sm grayscale opacity-70 transition-all duration-300 group shrink-0 snap-start w-[45%] sm:w-[30%] md:w-[18%]'
const clickableClass = 'hover:grayscale-0 hover:opacity-100 hover:shadow-md'
const imgClass = 'object-contain h-full w-full max-h-12 transition-transform duration-300'

function ClienteCard({ cliente }: { cliente: Cliente }) {
  const hasBlog = !!cliente.content?.trim()
  const image = (
    <Image
      src={cliente.logo}
      alt={`Logo ${cliente.name}`}
      width={140}
      height={60}
      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 15vw"
      quality={70}
      loading="lazy"
      className={hasBlog ? `${imgClass} group-hover:scale-105` : imgClass}
    />
  )

  if (hasBlog) {
    return (
      <Link href={`/clientes/${cliente.slug}`} className={`${cardClass} ${clickableClass}`} data-animate="scale">
        {image}
      </Link>
    )
  }

  return (
    <div className={cardClass} data-animate="scale">
      {image}
    </div>
  )
}

export default function ClientesCarousel({ clientes }: { clientes: Cliente[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  if (clientes.length === 0) return null

  const needsCarousel = clientes.length > VISIBLE_ON_SCREEN

  function scrollByCards(direction: 1 | -1) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.6, behavior: 'smooth' })
  }

  if (!needsCarousel) {
    return (
      <div className="flex flex-wrap justify-center gap-6 items-center">
        {clientes.map((cliente) => (
          <ClienteCard key={cliente.slug} cliente={cliente} />
        ))}
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth items-center pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {clientes.map((cliente) => (
          <ClienteCard key={cliente.slug} cliente={cliente} />
        ))}
      </div>

      <button
        type="button"
        aria-label="Anteriores"
        onClick={() => scrollByCards(-1)}
        className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-md hover:bg-igb-surface-low"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        aria-label="Siguientes"
        onClick={() => scrollByCards(1)}
        className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-md hover:bg-igb-surface-low"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
