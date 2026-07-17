'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import {
  TextField,
  TextArea,
  NumberField,
  ImageUpload,
  FileUpload,
  Checkbox,
} from '@/components/dashboard/Field'
import ContentEditor from '@/components/dashboard/ContentEditorBoundary'
import SaveButton from '@/components/dashboard/SaveButton'
import { AlertCircle } from 'lucide-react'
import type { Trabajo } from '@/lib/content'
import type { TrabajoState } from '@/app/actions/trabajos'

const HOY = new Date().toISOString().slice(0, 10)

interface Props {
  clienteId: string
  trabajo?: Trabajo
  entityId?: string
  action: (prevState: unknown, formData: FormData) => Promise<TrabajoState>
}

export default function TrabajoForm({ clienteId, trabajo, entityId, action }: Props) {
  const [state, formAction] = useFormState(action, undefined)
  const [content, setContent] = useState(trabajo?.content ?? '')

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="cliente_id" value={clienteId} />
      {entityId && <input type="hidden" name="id" value={entityId} />}
      <input type="hidden" name="content" value={content} />

      {state?.error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{state.error}</p>
        </div>
      )}

      <TextField label="Título" name="title" defaultValue={trabajo?.title} required placeholder="Ej: Izaje de tanque en Planta Edesur" />

      <TextField
        label="Fecha del trabajo"
        name="fecha"
        type="date"
        defaultValue={trabajo?.fecha ?? undefined}
        max={HOY}
        hint="Opcional. Se muestra en el detalle público del trabajo."
      />

      <TextArea
        label="Copete (excerpt)"
        name="excerpt"
        defaultValue={trabajo?.excerpt ?? undefined}
        rows={2}
        hint="Se muestra en la lista de trabajos del cliente."
        placeholder="Ej: Traslado e izaje de un tanque de 15.000 litros en la planta de Edesur."
      />

      <ImageUpload
        label="Imagen de portada"
        name="cover_image"
        defaultValue={trabajo?.cover_image ?? undefined}
        folder="trabajos"
        hint="Foto de la miniatura en el listado de trabajos del cliente."
        focalName="cover_image_focal"
        focalDefaultValue={trabajo?.cover_image_focal}
        focalMobileName="cover_image_focal_mobile"
        focalMobileDefaultValue={trabajo?.cover_image_focal_mobile}
      />

      <ImageUpload
        label="Imagen de banner (detalle)"
        name="banner_image"
        defaultValue={trabajo?.banner_image ?? undefined}
        folder="trabajos"
        hint="Foto grande que va detrás del título en la página de detalle. Si no se carga, se usa la imagen de portada."
        focalName="banner_image_focal"
        focalDefaultValue={trabajo?.banner_image_focal}
        focalMobileName="banner_image_focal_mobile"
        focalMobileDefaultValue={trabajo?.banner_image_focal_mobile}
      />

      <TextField
        label="Link de YouTube (opcional)"
        name="youtube_url"
        defaultValue={trabajo?.youtube_url ?? undefined}
        hint="Se muestra como video destacado en la página del trabajo."
        placeholder="Ej: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      />

      <FileUpload
        label="Documento adjunto (PDF, opcional)"
        name="attachment_url"
        defaultValue={trabajo?.attachment_url}
        folder="trabajos/adjuntos"
        hint="Plano, certificado o informe. Máximo 8 MB."
      />

      <div>
        <label className="block text-sm font-bold text-zinc-700 mb-1.5">Contenido</label>
        <ContentEditor value={content} onChange={setContent} />
      </div>

      <NumberField
        label="Orden"
        name="display_order"
        defaultValue={trabajo?.display_order ?? 0}
        min={0}
        hint="Número menor = aparece primero en la lista del cliente."
        placeholder="Ej: 1"
      />

      <Checkbox label="Publicado" name="published" defaultChecked={trabajo?.published ?? true} hint="Si está destildado, no se muestra en el sitio público." />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
