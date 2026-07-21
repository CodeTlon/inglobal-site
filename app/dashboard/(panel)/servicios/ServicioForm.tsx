'use client'

import { useFormState } from 'react-dom'
import {
  TextField,
  TextArea,
  NumberField,
  ImageUpload,
  StringList,
  Checkbox,
} from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import { AlertCircle } from 'lucide-react'
import type { Servicio } from '@/lib/content'
import type { ServicioState } from '@/app/actions/servicios'

interface Props {
  servicio?: Servicio
  entityId?: string
  action: (prevState: unknown, formData: FormData) => Promise<ServicioState>
}

const ICON_OPTIONS = ['ArrowUpToLine', 'HardHat', 'Move', 'Truck']

export default function ServicioForm({ servicio, entityId, action }: Props) {
  const [state, formAction] = useFormState(action, undefined)

  return (
    <form action={formAction} className="space-y-6">
      {entityId && <input type="hidden" name="id" value={entityId} />}

      {state?.error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{state.error}</p>
        </div>
      )}

      <TextField label="Título" name="title" defaultValue={servicio?.title} required maxLength={60} placeholder="Ej: Transporte de maquinaria pesada" />
      <TextArea
        label="Descripción corta (cards del home)"
        name="excerpt"
        defaultValue={servicio?.excerpt}
        rows={2}
        maxLength={80}
        placeholder="Ej: Traslado seguro de maquinaria pesada a todo el país."
        hint="Se muestra en la card de 'Qué hacemos' del home (2 líneas). Máximo 80 caracteres."
      />
      <TextArea
        label="Descripción detallada (página de Servicios)"
        name="desc"
        defaultValue={servicio?.desc}
        rows={4}
        placeholder="Ej: Traslado seguro de maquinaria pesada dentro y fuera de la provincia de Córdoba."
      />

      {/* Icon selector */}
      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
          Ícono
        </label>
        <select
          name="icon"
          defaultValue={servicio?.icon ?? ICON_OPTIONS[0]}
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
        defaultValue={Array.isArray(servicio?.specs) ? servicio.specs : []}
        placeholder="Ej: 3 a 200 Tn de capacidad"
        hint="Lista de características del servicio."
      />

      <ImageUpload
        label="Imagen"
        name="img"
        defaultValue={servicio?.img}
        folder="servicios"
        hint="Imagen de portada del servicio. Aspect ratio 16:10 recomendado."
      />

      <NumberField
        label="Orden de visualización"
        name="display_order"
        defaultValue={servicio?.display_order}
        min={1}
        hint="Número menor = aparece primero."
        placeholder="Ej: 1"
      />

      <Checkbox label="Publicado" name="published" defaultChecked={servicio?.published ?? true} hint="Si está destildado, no se muestra en el sitio público." />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
