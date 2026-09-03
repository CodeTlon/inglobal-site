'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

/** Botón flotante scroll-to-top. Aparece pasado un viewport de scroll, respeta prefers-reduced-motion. */
export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > window.innerHeight * 0.6)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  if (!visible) return null

  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <button
      type="button"
      onClick={() =>
        window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
      }
      aria-label="Volver arriba"
      className="fixed right-4 bottom-24 md:right-6 md:bottom-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-igb-on-surface text-white shadow-lg shadow-black/20 transition-all hover:bg-igb-yellow hover:text-igb-on-yellow active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-igb-yellow"
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  )
}
