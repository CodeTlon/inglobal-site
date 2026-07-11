'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'

// Error boundary del sitio público (home, servicios, montajes, clientes, contacto, etc.).
// El panel /dashboard tiene su propio error.tsx con estilo distinto (ver esa carpeta).
export default function Error({
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
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-24 bg-igb-surface">
      <div className="text-center max-w-md">
        <Image
          src="/images/logo.png"
          alt="Grúas InGlobal"
          width={140}
          height={41}
          className="h-10 w-auto mx-auto mb-8 object-contain"
        />
        <h1 className="font-headline text-2xl font-bold text-igb-on-surface mb-2">
          Algo salió mal
        </h1>
        <p className="text-igb-secondary mb-8">
          Ocurrió un error inesperado. Podés intentar de nuevo o volver al inicio.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button type="button" onClick={() => reset()} className="btn-primary">
            Reintentar
          </button>
          <Link href="/" className="btn-outline">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
