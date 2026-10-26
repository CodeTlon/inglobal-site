'use client'

import { useEffect, useState, useActionState } from 'react'
import { TextField, TextArea, SelectField, CheckboxGroup } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import { AlertCircle } from 'lucide-react'
import type { EventoAgenda, Grua, EmpresaAgenda, Operario } from '@/lib/agenda'
import { getRecursosOcupados, type AgendaState } from '@/app/actions/agenda'
import { TRANSICIONES_VALIDAS, MAX_GRUAS_EVENTO, type EstadoEvento } from '@/lib/validations/agenda'

const ESTADO_LABELS: Record<EstadoEvento, string> = {
  reserva: 'Reserva',
  programado: 'Programado',
  en_curso: 'En curso',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
}

// Alta: reserva o programado (igual que la app). Edición: el estado actual más
// las transiciones válidas hacia adelante; nunca se ofrece volver atrás.
function estadoOptions(actual?: EstadoEvento) {
  const values: EstadoEvento[] = actual ? [actual, ...TRANSICIONES_VALIDAS[actual]] : ['reserva', 'programado']
  return values.map((v) => ({ value: v, label: ESTADO_LABELS[v] }))
}

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
  const [state, formAction] = useActionState(action, undefined)
  const [clientError, setClientError] = useState<string | null>(null)

  const [fecha, setFecha] = useState(evento?.fecha ?? fechaInicial ?? '')
  const [fechaHasta, setFechaHasta] = useState(evento?.fecha_hasta ?? '')
  const [horaInicio, setHoraInicio] = useState(evento?.hora_inicio?.slice(0, 5) ?? '')
  const [horaFin, setHoraFin] = useState(evento?.hora_fin?.slice(0, 5) ?? '')
  const [ocupados, setOcupados] = useState<{ gruaIds: string[]; operarioIds: string[] }>({ gruaIds: [], operarioIds: [] })

  useEffect(() => {
    if (!fecha || !horaInicio) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- vacía los recursos ocupados mientras falta fecha u hora; se vuelven a pedir al completarlas
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
    // Cruza medianoche también de forma IMPLÍCITA cuando no se completó
    // fecha_hasta y hora_fin quedó "antes" que hora_inicio en el reloj (ej.
    // 22:00→02:00 sin tocar ese campo) — mismo criterio que
    // lib/validations/agenda.ts y lib/agenda-view.ts (cruzaMedianoche). Sin
    // esto, ese caso (el más común: turno nocturno de un solo día) seguía
    // bloqueado acá aunque el backend ya lo soportara.
    const cruzaDias =
      (!!fechaHasta && fechaHasta !== fecha) ||
      (!fechaHasta && !!horaFin && horaFin <= horaInicio)
    if (horaInicio && horaFin && !cruzaDias) {
      const [hi, mi] = horaInicio.split(':').map(Number)
      const [hf, mf] = horaFin.split(':').map(Number)
      if (hf * 60 + mf < hi * 60 + mi + MIN_DURACION_MIN) {
        e.preventDefault()
        setClientError(`La hora de fin debe ser al menos ${MIN_DURACION_MIN} minutos después de la de inicio.`)
        return
      }
    }
    let gruaIds: unknown[] = []
    try {
      gruaIds = JSON.parse((formData.get('grua_ids') as string | null) || '[]')
    } catch {
      gruaIds = []
    }
    if (!Array.isArray(gruaIds) || gruaIds.length === 0) {
      e.preventDefault()
      setClientError('Elegí al menos una grúa.')
      return
    }
    if (gruaIds.length > MAX_GRUAS_EVENTO) {
      e.preventDefault()
      setClientError(`Máximo ${MAX_GRUAS_EVENTO} grúas por servicio.`)
      return
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
    <fieldset disabled={evento?.estado === 'finalizado' || evento?.estado === 'cancelado'} className="space-y-6 min-w-0 border-0 p-0 m-0">
      {evento && <input type="hidden" name="id" value={evento.id} />}
      <input type="hidden" name="from" value={from ?? ''} />

      {(clientError || state?.error) && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
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

      <SelectField
        label="Empresa"
        name="empresa_id"
        defaultValue={evento?.empresa_id ?? undefined}
        options={empresas.map((e) => ({ value: e.id, label: e.nombre }))}
        placeholder="Seleccioná una empresa"
      />

      <CheckboxGroup
        label="Grúas"
        name="grua_ids"
        options={gruas.map((g) => ({
          value: g.id,
          label: ocupados.gruaIds.includes(g.id) ? `${g.nombre} (ocupada en ese horario)` : g.nombre,
          disabled: ocupados.gruaIds.includes(g.id),
        }))}
        defaultValue={evento?.gruas.map((g) => g.id)}
        hint={`Obligatorio: elegí al menos una grúa (máximo ${MAX_GRUAS_EVENTO}). La primera que marques es la principal.`}
      />

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

      <SelectField label="Estado" name="estado" defaultValue={evento?.estado ?? 'programado'} options={estadoOptions(evento?.estado as EstadoEvento | undefined)} />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </fieldset>
    </form>
  )
}
