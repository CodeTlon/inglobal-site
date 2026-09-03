'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

/**
 * Barra fija bottom, solo mobile — CTA a Contacto/Cotización. Oculta en /contacto
 * (ya estás ahí) y en /dashboard, /agenda-tv (esas rutas tapan el layout raíz con
 * un overlay fixed z-[100], pero se excluye igual por si ese overlay cambia).
 */
export default function StickyMobileCTA() {
  const pathname = usePathname()
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/agenda-tv') || pathname === '/contacto') {
    return null
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 md:hidden">
      <Link
        href="/contacto"
        className="flex items-center justify-center gap-2 bg-igb-yellow px-4 py-3.5 font-headline font-bold text-sm text-igb-on-yellow shadow-[0_-4px_16px_rgba(0,0,0,0.12)] transition-colors hover:brightness-95 active:scale-[0.98]"
        style={{ paddingBottom: 'calc(0.875rem + env(safe-area-inset-bottom))' }}
      >
        Solicitar Cotización
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  )
}
