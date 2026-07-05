'use client'

import { useFormState } from 'react-dom'
import { updateServicio } from '@/app/actions/servicios'
import {
  TextField,
  TextArea,
  NumberField,
  ImageUpload,
  StringList,
  Checkbox,
} from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import { CheckCircle, AlertCircle } from 'lucide-react'
import type { Servicio } from '@/lib/content'

interface Props {
  servicio: Servicio
}

const ICON_OPTIONS = ['ArrowUpToLine', 'HardHat', 'Move', 'Truck']

export default function ServicioForm({ servicio }: Props) {
  const [state, formAction] = useFormState(updateServicio, undefined)

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden ID — action reads formData.get('id') */}
      <input type="hidden" name="id" value={servicio.id} />

      {state?.success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-700 text-sm font-medium">Servicio actualizado correctamente.</p>
        </div>
      )}
      {state?.error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{state.error}</p>
        </div>
      )}

      <TextField label="Título" name="title" defaultValue={servicio.title} required />
      <TextArea label="Descripción" name="desc" defaultValue={servicio.desc} rows={4} />

      {/* Icon selector */}
      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
          Ícono
        </label>
        <select
          name="icon"
          defaultValue={servicio.icon}
          className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-igb-yellow/50 focus:border-igb-yellow-dark transition-colors"
        >
          {ICON_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <p className="text-zinc-400 text-xs mt-1.5">
          Nombre exacto del ícono de lucide-react.
        </p>
      </div>

      <StringList
        label="Especificaciones"
        name="specs"
        defaultValue={Array.isArray(servicio.specs) ? servicio.specs : []}
        placeholder="Ej: 3 a 200 Tn de capacidad"
        hint="Lista de características del servicio."
      />

      <ImageUpload
        label="Imagen"
        name="img"
        defaultValue={servicio.img}
        folder="servicios"
        hint="Imagen de portada del servicio. Aspect ratio 16:10 recomendado."
      />

      <NumberField
        label="Orden de visualización"
        name="display_order"
        defaultValue={servicio.display_order}
        min={1}
        hint="Número menor = aparece primero."
      />

      <Checkbox label="Publicado" name="published" defaultChecked={servicio.published ?? true} hint="Si está destildado, no se muestra en el sitio público." />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
