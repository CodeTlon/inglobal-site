import { ESTADOS_EVENTO } from '@/lib/validations/agenda'
import { estadoStripColor, formatEstado } from '@/lib/agenda-view'

/** Leyenda de colores de estado — misma fuente (estadoStripColor/formatEstado) que pinta cada card, no puede desincronizarse. */
export default function EstadoLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-6">
      {ESTADOS_EVENTO.map((estado) => (
        <div key={estado} className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${estadoStripColor(estado)}`} />
          <span className="text-sm font-medium text-zinc-600">{formatEstado(estado)}</span>
        </div>
      ))}
    </div>
  )
}
