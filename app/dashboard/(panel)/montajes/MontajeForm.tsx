'use client'

import { useFormState } from 'react-dom'
import {
  TextField,
  TextArea,
  ImageUpload,
  StringList,
} from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import { CheckCircle, AlertCircle } from 'lucide-react'
import type { Montaje } from '@/lib/content'
import type { MontajeState } from '@/app/actions/montajes'

interface Props {
  montaje?: Montaje
  entityId?: string
  action: (prevState: unknown, formData: FormData) => Promise<MontajeState>
  successMessage?: string
}

export default function MontajeForm({ montaje, entityId, action, successMessage = 'Guardado correctamente.' }: Props) {
  const [state, formAction] = useFormState(action, undefined)

  return (
    <form action={formAction} className="space-y-6">
      {entityId && <input type="hidden" name="id" value={entityId} />}

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

      <TextField label="Título" name="title" defaultValue={montaje?.title} required />
      <TextField
        label="Slug (URL)"
        name="slug"
        defaultValue={montaje?.slug}
        hint={montaje ? 'Modificar el slug cambia la URL pública del montaje.' : 'Identificador único en la URL. Solo letras, números y guiones.'}
        required
      />

      <TextArea
        label="Extracto (resumen)"
        name="excerpt"
        defaultValue={montaje?.excerpt ?? undefined}
        rows={3}
        hint="Descripción corta que aparece en el listado."
      />

      <TextArea
        label="Contenido completo"
        name="content"
        defaultValue={montaje?.content ?? undefined}
        rows={8}
        hint="Texto de la página de detalle. Separar párrafos con una línea en blanco."
      />

      <ImageUpload
        label="Imagen de portada"
        name="cover_image"
        defaultValue={montaje?.cover_image}
        folder="montajes"
        hint="Foto principal del montaje. Aspect ratio 16:10 recomendado."
      />

      <StringList
        label="Tags"
        name="tags"
        defaultValue={montaje?.tags ?? []}
        placeholder="Ej: Industrial"
        hint="Etiquetas que se muestran debajo del título en el listado y en la página de detalle."
      />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
