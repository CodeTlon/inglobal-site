'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { X, MapPin, Users, Clock, Building2, Pencil } from 'lucide-react'
import type { EventoAgenda } from '@/lib/agenda'
import { estadoColorClassesLight, formatEstado, getEstadoVisual } from '@/lib/agenda-view'

/**
 * Panel de detalle al clickear un evento en la grilla semanal/diaria. Solo
 * lectura salvo que el caller pase `editHref` (el dashboard lo arma con
 * `from` de vuelta al día/semana actual; la TV de /agenda-tv nunca lo pasa —
 * ahí no hay sesión de admin, no correspondería un link a editar).
 */
export default function AgendaEventModal({
  evento,
  onClose,
  editHref,
}: {
  evento: EventoAgenda | null
  onClose: () => void
  editHref?: string
}) {
  useEffect(() => {
    if (!evento) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [evento, onClose])

  if (!evento) return null

  const fecha = new Date(`${evento.fecha}T00:00:00`).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  // Si fecha_hasta viene seteado pero es el mismo día que fecha (rango
  // redundante, no un evento multi-día real), no se muestra "hasta el
  // mismo día" — solo la fecha una vez.
  const fechaHasta = evento.fecha_hasta && evento.fecha_hasta !== evento.fecha
    ? new Date(`${evento.fecha_hasta}T00:00:00`).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })
    : null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-zinc-200 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className={`inline-block text-xs font-bold px-2 py-1 rounded mb-2 ${estadoColorClassesLight(getEstadoVisual(evento))}`}>
              {formatEstado(getEstadoVisual(evento))}
            </span>
            <h2 className="font-headline font-bold text-lg text-zinc-900">{evento.grua?.nombre ?? 'Grúa'}</h2>
            <p className="text-sm text-zinc-500 capitalize">
              {fecha}
              {fechaHasta && <> hasta el {fechaHasta}</>}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {editHref && (
              <Link
                href={editHref}
                aria-label="Editar evento"
                className="rounded-full p-2.5 -m-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
              >
                <Pencil size={18} />
              </Link>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="rounded-full p-2.5 -m-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-zinc-600">
            <Clock size={16} className="text-zinc-400 flex-shrink-0" />
            {evento.hora_inicio.slice(0, 5)}{evento.hora_fin ? ` – ${evento.hora_fin.slice(0, 5)}` : ''}
          </div>
          <div className="flex items-center gap-2 text-zinc-600">
            <Building2 size={16} className="text-zinc-400 flex-shrink-0" />
            {evento.empresa?.nombre ?? 'Empresa'}
          </div>
          {evento.ubicacion && (
            <div className="flex items-center gap-2 text-zinc-600">
              <MapPin size={16} className="text-zinc-400 flex-shrink-0" />
              {evento.ubicacion}
            </div>
          )}
          {evento.operarios.length > 0 && (
            <div className="flex items-start gap-2 text-zinc-600">
              <Users size={16} className="text-zinc-400 flex-shrink-0 mt-0.5" />
              {evento.operarios.map((o) => o.nombre).join(', ')}
            </div>
          )}
          {evento.notas && (
            <p className="text-zinc-500 pt-3 border-t border-zinc-100">{evento.notas}</p>
          )}
        </div>
      </div>
    </div>
  )
}
