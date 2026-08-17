'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Cliente } from '@/lib/content'

// ponytail: si entran todos en una pantalla no hace falta scroll-snap ni flechas
const VISIBLE_ON_SCREEN = 5
const AUTOPLAY_MS = 3500

// Ancho exacto por breakpoint (2/3/5 tarjetas a la vista, mismo patrón calc que ClientesGrid)
// para que nunca asome un "pico" fraccionario del próximo cliente.
const cardClass =
  'bg-white rounded-xl p-6 flex items-center justify-center h-28 border border-slate-100 shadow-sm grayscale opacity-70 transition-all duration-300 group shrink-0 snap-start w-[calc(50%-0.75rem)] sm:w-[calc(33.333%-1rem)] md:w-[calc(20%-1.2rem)]'
const clickableClass = 'hover:grayscale-0 hover:opacity-100 hover:shadow-md'
const imgClass = 'object-contain h-full w-full max-h-12 transition-transform duration-300'

function ClienteCard({ cliente }: { cliente: Cliente }) {
  const hasBlog = cliente.tiene_blog
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
  const pausedRef = useRef(false)

  const needsCarousel = clientes.length > VISIBLE_ON_SCREEN

  function scrollByCards(direction: 1 | -1) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.6, behavior: 'smooth' })
  }

  useEffect(() => {
    if (!needsCarousel) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = setInterval(() => {
      const el = scrollerRef.current
      if (!el || pausedRef.current) return
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: el.clientWidth * 0.6, behavior: 'smooth' })
      }
    }, AUTOPLAY_MS)

    return () => clearInterval(id)
  }, [needsCarousel])

  if (clientes.length === 0) return null

  if (!needsCarousel) {
    return (
      <div className="flex flex-wrap justify-center gap-6 items-center">
        {clientes.map((cliente) => (
          <ClienteCard key={cliente.slug} cliente={cliente} />
        ))}
      </div>
    )
  }

  function pause() {
    pausedRef.current = true
  }
  function resume() {
    pausedRef.current = false
  }

  return (
    <div
      className="relative md:px-10"
      onPointerEnter={pause}
      onPointerLeave={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
    >
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
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-md hover:bg-igb-surface-low"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        aria-label="Siguientes"
        onClick={() => scrollByCards(1)}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-md hover:bg-igb-surface-low"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
