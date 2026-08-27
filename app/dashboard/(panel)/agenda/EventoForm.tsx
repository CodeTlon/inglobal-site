'use client'

import { useEffect, useState } from 'react'
import { useFormState } from 'react-dom'
import { TextField, TextArea, SelectField, CheckboxGroup } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import { AlertCircle } from 'lucide-react'
import type { EventoAgenda, Grua, EmpresaAgenda, Operario } from '@/lib/agenda'
import { getRecursosOcupados, type AgendaState } from '@/app/actions/agenda'

const ESTADOS = [
  { value: 'programado', label: 'Programado' },
  { value: 'en_curso', label: 'En curso' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'cancelado', label: 'Cancelado' },
]

// Fecha local en formato YYYY-MM-DD. OJO: d.toISOString() pasa a UTC — con
// Argentina en UTC-3 eso corre "hoy" un día para adelante entre las 21:00 y
// las 23:59 locales (el reloj UTC ya cruzó medianoche).
function toDateInput(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const today = new Date()
const FECHA_MIN = toDateInput(today)
const FECHA_MAX = toDateInput(new Date(today.getFullYear(), today.getMonth() + 6, today.getDate()))
const MIN_DURACION_MIN = 15

interface Props {
  evento?: EventoAgenda
  gruas: Grua[]
  empresas: EmpresaAgenda[]
  operarios: Operario[]
  action: (prevState: unknown, formData: FormData) => Promise<AgendaState>
  /** De dónde vino (ej. /dashboard/agenda/calendario?day=2026-08-07). Se manda
   * de vuelta en el submit para que el redirect post-guardado vuelva ahí en
   * vez de siempre al listado genérico — así no se pierde el día en el que
   * estabas parado al crear/editar un evento. */
  from?: string
  /** Fecha con la que precargar un evento nuevo (viene de "+" en el calendario). */
  fechaInicial?: string
}

export default function EventoForm({ evento, gruas, empresas, operarios, action, from, fechaInicial }: Props) {
  const [state, formAction] = useFormState(action, undefined)
  const [clientError, setClientError] = useState<string | null>(null)

  const [fecha, setFecha] = useState(evento?.fecha ?? fechaInicial ?? '')
  const [fechaHasta, setFechaHasta] = useState(evento?.fecha_hasta ?? '')
  const [horaInicio, setHoraInicio] = useState(evento?.hora_inicio?.slice(0, 5) ?? '')
  const [horaFin, setHoraFin] = useState(evento?.hora_fin?.slice(0, 5) ?? '')
  const [ocupados, setOcupados] = useState<{ gruaIds: string[]; operarioIds: string[] }>({ gruaIds: [], operarioIds: [] })

  useEffect(() => {
    if (!fecha || !horaInicio) {
      setOcupados({ gruaIds: [], operarioIds: [] })
      return
    }
    let cancelado = false
    getRecursosOcupados(fecha, fechaHasta || null, horaInicio, horaFin || null, evento?.id)
      .then((res) => {
        if (!cancelado) setOcupados(res)
      })
      .catch(() => {
        // Antes esto era una promesa sin manejar: si fallaba, `ocupados`
        // quedaba en su último valor (o vacío) sin ningún aviso — el picker
        // no deshabilitaba nada por estar "libre" cuando en realidad no se
        // sabía. El servidor igual rechaza un solapamiento real (constraint
        // de la DB, ver migración 024), así que esto es UX, no integridad de
        // datos — pero vale avisar en vez de fallar en silencio.
        if (!cancelado) setClientError('No se pudo confirmar la disponibilidad de grúa/operarios. Revisá tu conexión.')
      })
    return () => {
      cancelado = true
    }
  }, [fecha, fechaHasta, horaInicio, horaFin, evento?.id])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget)
    const fecha = formData.get('fecha') as string
    const fechaHasta = formData.get('fecha_hasta') as string
    if (fechaHasta && fechaHasta < fecha) {
      e.preventDefault()
      setClientError('La fecha de fin no puede ser anterior a la fecha de inicio.')
      return
    }
    const horaInicio = formData.get('hora_inicio') as string
    const horaFin = formData.get('hora_fin') as string
    // Si fecha_hasta cae en otro día, hora_fin ya pertenece a ESE día — no
    // tiene que ser "después" de hora_inicio en el reloj (turno 22:00→02:00
    // cruzando medianoche). Antes esto bloqueaba el submit en el cliente sin
    // ni llegar a pegarle al backend, que ya soporta el caso.
    const cruzaDias = !!fechaHasta && fechaHasta !== fecha
    if (horaInicio && horaFin && !cruzaDias) {
      const [hi, mi] = horaInicio.split(':').map(Number)
      const [hf, mf] = horaFin.split(':').map(Number)
      if (hf * 60 + mf < hi * 60 + mi + MIN_DURACION_MIN) {
        e.preventDefault()
        setClientError(`La hora de fin debe ser al menos ${MIN_DURACION_MIN} minutos después de la de inicio.`)
        return
      }
    }
    const operarioIdsRaw = formData.get('operario_ids') as string | null
    let operarioIds: unknown[] = []
    try {
      operarioIds = operarioIdsRaw ? JSON.parse(operarioIdsRaw) : []
    } catch {
      operarioIds = []
    }
    if (!Array.isArray(operarioIds) || operarioIds.length === 0) {
      e.preventDefault()
      setClientError('Asigná al menos un operario al evento.')
      return
    }

    setClientError(null)
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-6">
      {evento && <input type="hidden" name="id" value={evento.id} />}
      <input type="hidden" name="from" value={from ?? ''} />

      {(clientError || state?.error) && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{clientError ?? state?.error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Fecha" name="fecha" type="date" defaultValue={evento?.fecha} required min={FECHA_MIN} max={FECHA_MAX} onChange={setFecha} />
        <TextField
          label="Hasta (opcional)"
          name="fecha_hasta"
          type="date"
          defaultValue={evento?.fecha_hasta ?? undefined}
          min={FECHA_MIN}
          max={FECHA_MAX}
          hint="Completar solo si el trabajo dura varios días seguidos con la misma grúa/operarios."
          onChange={setFechaHasta}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Hora inicio" name="hora_inicio" type="time" defaultValue={evento?.hora_inicio} required onChange={setHoraInicio} />
        <TextField label="Hora fin" name="hora_fin" type="time" defaultValue={evento?.hora_fin ?? undefined} onChange={setHoraFin} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label="Grúa"
          name="grua_id"
          defaultValue={evento?.grua_id}
          options={gruas.map((g) => ({
            value: g.id,
            label: ocupados.gruaIds.includes(g.id) ? `${g.nombre} (ocupada en ese horario)` : g.nombre,
            disabled: ocupados.gruaIds.includes(g.id),
          }))}
          placeholder="Seleccioná una grúa"
        />
        <SelectField
          label="Empresa"
          name="empresa_id"
          defaultValue={evento?.empresa_id}
          options={empresas.map((e) => ({ value: e.id, label: e.nombre }))}
          placeholder="Seleccioná una empresa"
        />
      </div>

      <CheckboxGroup
        label="Operarios asignados"
        name="operario_ids"
        options={operarios.map((o) => ({
          value: o.id,
          label: ocupados.operarioIds.includes(o.id) ? `${o.nombre} (ocupado)` : o.nombre,
          disabled: ocupados.operarioIds.includes(o.id),
        }))}
        defaultValue={evento?.operarios.map((o) => o.id)}
        hint="Obligatorio: asigná al menos un operario. Solo se listan operarios activos."
      />

      <TextField label="Ubicación" name="ubicacion" defaultValue={evento?.ubicacion ?? undefined} hint="Dirección o link de Google Maps." placeholder="Ej: Av. Colón 1234, Córdoba" />

      <TextArea label="Notas" name="notas" defaultValue={evento?.notas ?? undefined} rows={3} placeholder="Ej: Coordinar acceso con el encargado de obra antes de las 14hs" />

      <SelectField label="Estado" name="estado" defaultValue={evento?.estado ?? 'programado'} options={ESTADOS} />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
