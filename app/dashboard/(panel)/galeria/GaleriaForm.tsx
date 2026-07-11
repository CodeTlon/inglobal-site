'use client'

import { useFormState } from 'react-dom'
import {
  TextField,
  ImageUpload,
  SelectField,
  NumberField,
  Checkbox,
} from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import { AlertCircle } from 'lucide-react'
import type { Galeria } from '@/lib/content'
import type { GaleriaState } from '@/app/actions/galeria'

interface Props {
  item?: Galeria
  entityId?: string
  action: (prevState: unknown, formData: FormData) => Promise<GaleriaState>
}

const MOBILE_SPAN_OPTIONS = [
  { value: 1, label: '1 columna' },
  { value: 2, label: '2 columnas (ancho completo)' },
]

const DESKTOP_COL_OPTIONS = [
  { value: 1, label: '1 columna' },
  { value: 2, label: '2 columnas' },
  { value: 3, label: '3 columnas' },
  { value: 4, label: '4 columnas (ancho completo)' },
]

const ROW_OPTIONS = [
  { value: 1, label: '1 fila' },
  { value: 2, label: '2 filas (doble alto)' },
]

export default function GaleriaForm({ item, entityId, action }: Props) {
  const [state, formAction] = useFormState(action, undefined)

  return (
    <form action={formAction} className="space-y-6">
      {entityId && <input type="hidden" name="id" value={entityId} />}

      {state?.error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{state.error}</p>
        </div>
      )}

      <ImageUpload
        label="Imagen"
        name="imagen"
        defaultValue={item?.imagen}
        folder="galeria"
        hint="Foto de operación, izaje o montaje. Se recomienda formato horizontal."
      />

      <TextField
        label="Texto alternativo (accesibilidad / SEO)"
        name="alt"
        defaultValue={item?.alt}
        required
        placeholder="Ej: Grúa telescópica operando en planta industrial"
      />

      <div>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
          Tamaño en la grilla — cuánto espacio ocupa esta imagen en cada tamaño de pantalla
        </p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <SelectField
            label="Ancho en mobile"
            name="col_span_mobile"
            defaultValue={item?.col_span_mobile ?? 1}
            options={MOBILE_SPAN_OPTIONS}
          />
          <SelectField
            label="Alto en mobile"
            name="row_span_mobile"
            defaultValue={item?.row_span_mobile ?? 1}
            options={ROW_OPTIONS}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Ancho en desktop"
            name="col_span_desktop"
            defaultValue={item?.col_span_desktop ?? 1}
            options={DESKTOP_COL_OPTIONS}
          />
          <SelectField
            label="Alto en desktop"
            name="row_span_desktop"
            defaultValue={item?.row_span_desktop ?? 1}
            options={ROW_OPTIONS}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 items-end">
        <NumberField
          label="Orden"
          name="display_order"
          defaultValue={item?.display_order ?? 0}
          min={0}
          hint="Menor número aparece primero."
        />
        <Checkbox label="Publicado" name="published" defaultChecked={item?.published ?? true} />
      </div>

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
