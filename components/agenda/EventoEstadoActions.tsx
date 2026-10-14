'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { cambiarEstadoEvento } from '@/app/actions/agenda'
import { TRANSICIONES_VALIDAS, type EstadoEvento } from '@/lib/validations/agenda'
import { formatEstado } from '@/lib/agenda-view'

const VERBOS: Record<EstadoEvento, string> = {
  reserva: 'Pasar a reserva',
  programado: 'Confirmar (programado)',
  en_curso: 'Iniciar',
  finalizado: 'Finalizar',
  cancelado: 'Cancelar evento',
}

/**
 * Botones de cambio de estado: solo ofrece las transiciones válidas desde el
 * estado actual (mismas reglas que la app: reserva -> programado -> en curso ->
 * finalizado, y cancelar desde cualquiera de los tres primeros). La validación
 * real es del servidor; esto solo evita ofrecer lo que va a rechazar.
 */
export default function EventoEstadoActions({
  eventoId,
  estado,
  onDone,
}: {
  eventoId: string
  estado: EstadoEvento
  onDone?: () => void
}) {
  const router = useRouter()
  const [busy, setBusy] = useState<EstadoEvento | null>(null)
  const [error, setError] = useState<string | null>(null)
  const opciones = TRANSICIONES_VALIDAS[estado] ?? []

  if (opciones.length === 0) return null

  async function cambiar(nuevo: EstadoEvento) {
    const msg = nuevo === 'cancelado'
      ? '¿Cancelar este evento? No se puede revertir.'
      : `¿Pasar el evento a "${formatEstado(nuevo)}"? No se puede volver atrás.`
    if (!window.confirm(msg)) return
    setBusy(nuevo)
    setError(null)
    const res = await cambiarEstadoEvento(eventoId, nuevo)
    setBusy(null)
    if (res?.error) {
      setError(res.error)
      return
    }
    router.refresh()
    onDone?.()
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {opciones.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => cambiar(o)}
            disabled={busy !== null}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors disabled:opacity-60 ${
              o === 'cancelado' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-zinc-900 text-white hover:bg-zinc-700'
            }`}
          >
            {busy === o && <Loader2 size={12} className="animate-spin" />}
            {VERBOS[o]}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
    </div>
  )
}
