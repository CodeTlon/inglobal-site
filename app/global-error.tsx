'use client'

import { useEffect } from 'react'

// Fallback de último recurso: se monta si el ROOT layout (app/layout.tsx)
// mismo tira un error, por eso define su propio <html>/<body> y usa estilos
// inline (no depende de que globals.css/Tailwind se haya podido inyectar).
export default function GlobalError({
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
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          background: '#f8f9fa',
          color: '#191c1d',
          textAlign: 'center',
          padding: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
            Grúas InGlobal — Error inesperado
          </h1>
          <p style={{ color: '#575d78', marginBottom: '24px' }}>
            Ocurrió un problema al cargar el sitio. Por favor, recargá la página.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: '#f5d100',
              color: '#221b00',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  )
}
