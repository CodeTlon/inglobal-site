'use client'

import { useFormState } from 'react-dom'
import {
  TextField,
  ImageUpload,
  NumberField,
  Checkbox,
} from '@/components/dashboard/Field'
import SpanPicker from '@/components/dashboard/SpanPicker'
import SaveButton from '@/components/dashboard/SaveButton'
import { AlertCircle } from 'lucide-react'
import type { Galeria } from '@/lib/content'
import type { GaleriaState } from '@/app/actions/galeria'

interface Props {
  item?: Galeria
  entityId?: string
  action: (prevState: unknown, formData: FormData) => Promise<GaleriaState>
}

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
        <div className="flex flex-wrap gap-8">
          <SpanPicker
            label="En mobile"
            colsName="col_span_mobile"
            rowsName="row_span_mobile"
            maxCols={2}
            maxRows={2}
            defaultCols={item?.col_span_mobile ?? 1}
            defaultRows={item?.row_span_mobile ?? 1}
          />
          <SpanPicker
            label="En desktop"
            colsName="col_span_desktop"
            rowsName="row_span_desktop"
            maxCols={4}
            maxRows={2}
            defaultCols={item?.col_span_desktop ?? 1}
            defaultRows={item?.row_span_desktop ?? 1}
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
          placeholder="Ej: 1"
        />
        <Checkbox label="Publicado" name="published" defaultChecked={item?.published ?? true} />
      </div>

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
