'use client'

import { useFormState } from 'react-dom'
import { TextField, TextArea, SelectField, CheckboxGroup } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import { CheckCircle, AlertCircle } from 'lucide-react'
import type { EventoAgenda, Grua, EmpresaAgenda, Operario } from '@/lib/agenda'
import type { AgendaState } from '@/app/actions/agenda'

const ESTADOS = [
  { value: 'programado', label: 'Programado' },
  { value: 'en_curso', label: 'En curso' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'cancelado', label: 'Cancelado' },
]

interface Props {
  evento?: EventoAgenda
  gruas: Grua[]
  empresas: EmpresaAgenda[]
  operarios: Operario[]
  action: (prevState: unknown, formData: FormData) => Promise<AgendaState>
  successMessage?: string
}

export default function EventoForm({ evento, gruas, empresas, operarios, action, successMessage = 'Guardado correctamente.' }: Props) {
  const [state, formAction] = useFormState(action, undefined)

  return (
    <form action={formAction} className="space-y-6">
      {evento && <input type="hidden" name="id" value={evento.id} />}

      {state?.success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-700 text-sm font-medium">{successMessage}</p>
        </div>
      )}
      {state?.error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{state.error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TextField label="Fecha" name="fecha" type="date" defaultValue={evento?.fecha} required />
        <TextField label="Hora inicio" name="hora_inicio" type="time" defaultValue={evento?.hora_inicio} required />
        <TextField label="Hora fin" name="hora_fin" type="time" defaultValue={evento?.hora_fin ?? undefined} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label="Grúa"
          name="grua_id"
          defaultValue={evento?.grua_id}
          options={gruas.map((g) => ({ value: g.id, label: g.nombre }))}
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
        options={operarios.map((o) => ({ value: o.id, label: o.nombre }))}
        defaultValue={evento?.operarios.map((o) => o.id)}
      />

      <TextField label="Ubicación" name="ubicacion" defaultValue={evento?.ubicacion ?? undefined} hint="Dirección o link de Google Maps." />

      <TextArea label="Notas" name="notas" defaultValue={evento?.notas ?? undefined} rows={3} />

      <SelectField label="Estado" name="estado" defaultValue={evento?.estado ?? 'programado'} options={ESTADOS} />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
