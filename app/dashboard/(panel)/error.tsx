'use client'

import Link from 'next/link'
import { useEffect } from 'react'

// Error boundary propio del panel: mantiene el tono del CMS (no reusa el
// del sitio público en app/error.tsx) y ofrece volver al inicio del panel.
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error)
    }
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[50vh] px-6">
      <div className="text-center max-w-md">
        <h1 className="font-headline text-xl font-bold text-zinc-900 mb-2">
          Algo salió mal en el panel
        </h1>
        <p className="text-sm text-zinc-500 mb-6">
          No se pudo cargar esta sección. Reintentá o volvé al inicio del panel.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 rounded-lg bg-igb-yellow text-igb-on-yellow text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Reintentar
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700 text-sm font-medium hover:bg-zinc-50 transition-colors"
          >
            Ir al inicio del panel
          </Link>
        </div>
      </div>
    </div>
  )
}
