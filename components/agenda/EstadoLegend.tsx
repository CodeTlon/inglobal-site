'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { ESTADOS_EVENTO } from '@/lib/validations/agenda'
import { estadoStripColor, formatEstado } from '@/lib/agenda-view'

/** Ícono de info que despliega, en un modal, qué significa cada color de estado. */
export default function EstadoLegend() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Flotante en la esquina, chico y semi-transparente hasta que se usa — a
          propósito, para no competir con el mes ni el calendario en la TV. */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Referencias de colores"
        className="fixed bottom-6 right-6 z-[150] flex items-center justify-center rounded-full border border-zinc-200 bg-white w-9 h-9 text-zinc-400 opacity-60 hover:opacity-100 hover:bg-zinc-50 active:scale-95 transition-all"
      >
        <Info size={18} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center px-6"
          onClick={() => setOpen(false)}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs space-y-3" onClick={(e) => e.stopPropagation()}>
            <p className="font-bold text-zinc-900 text-center mb-1">Estados del calendario</p>
            {ESTADOS_EVENTO.map((estado) => (
              <div key={estado} className="flex items-center gap-3">
                <span className={`w-3.5 h-3.5 rounded-full ${estadoStripColor(estado)}`} />
                <span className="text-base text-zinc-600">{formatEstado(estado)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
