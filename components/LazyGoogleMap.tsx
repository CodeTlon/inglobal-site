'use client'
import { useState } from 'react'
import { MapPin } from 'lucide-react'

const MAP_SRC =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3407.907109390354!2d-64.18387818753284!3d-31.333938374192776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9432997e4baee84d%3A0xd4a924978118ee6f!2sGr%C3%BAas%20Inglobal%20SRL!5e0!3m2!1ses-419!2sar!4v1775834094244!5m2!1ses-419!2sar'

/**
 * Carga el iframe de Google Maps sólo cuando el usuario hace clic.
 * Evita que Google fije cookies de terceros en la carga inicial de página,
 * lo que mejora la puntuación de "Best Practices" en Lighthouse.
 */
export default function LazyGoogleMap() {
  const [loaded, setLoaded] = useState(false)

  if (loaded) {
    return (
      <iframe
        src={MAP_SRC}
        width="100%"
        height="450"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Ubicación Grúas InGlobal S.R.L."
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      className="w-full h-[450px] bg-igb-surface-low hover:bg-igb-surface-high transition-colors flex flex-col items-center justify-center gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-igb-yellow-dark"
      aria-label="Cargar mapa interactivo de Google Maps"
    >
      <MapPin className="w-10 h-10 text-igb-yellow-dark" aria-hidden="true" />
      <div className="text-center pointer-events-none">
        <p className="font-headline font-bold text-igb-on-surface text-lg">
          Grúas InGlobal S.R.L.
        </p>
        <p className="text-igb-secondary text-sm mt-1">
          Ana Riglos de Irigoyen S/N, Córdoba
        </p>
      </div>
      <span className="mt-2 px-6 py-2.5 bg-igb-yellow text-igb-on-yellow font-headline font-bold text-sm rounded-md pointer-events-none">
        Ver en Google Maps
      </span>
      <p className="text-xs text-igb-secondary/60 max-w-xs text-center pointer-events-none">
        Clic para cargar el mapa interactivo
      </p>
    </button>
  )
}
