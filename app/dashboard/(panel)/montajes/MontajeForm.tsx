'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import {
  TextField,
  TextArea,
  ImageUpload,
  StringList,
  Checkbox,
} from '@/components/dashboard/Field'
import ContentEditor from '@/components/dashboard/ContentEditorBoundary'
import SaveButton from '@/components/dashboard/SaveButton'
import { AlertCircle } from 'lucide-react'
import type { Montaje } from '@/lib/content'
import type { MontajeState } from '@/app/actions/montajes'

interface Props {
  montaje?: Montaje
  entityId?: string
  action: (prevState: unknown, formData: FormData) => Promise<MontajeState>
}

export default function MontajeForm({ montaje, entityId, action }: Props) {
  const [state, formAction] = useFormState(action, undefined)
  const [content, setContent] = useState(montaje?.content ?? '')

  return (
    <form action={formAction} className="space-y-6">
      {entityId && <input type="hidden" name="id" value={entityId} />}
      <input type="hidden" name="content" value={content} />

      {state?.error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{state.error}</p>
        </div>
      )}

      <TextField label="Título" name="title" defaultValue={montaje?.title} required placeholder="Ej: Izaje de tanque en Planta Edesur" />

      <TextArea
        label="Extracto (resumen)"
        name="excerpt"
        defaultValue={montaje?.excerpt ?? undefined}
        rows={3}
        hint="Descripción corta que aparece en el listado."
        placeholder="Ej: Traslado e izaje de un tanque de 15.000 litros en la planta de Edesur."
      />

      <div>
        <label className="block text-sm font-bold text-zinc-700 mb-1.5">Contenido completo</label>
        <ContentEditor value={content} onChange={setContent} />
      </div>

      <ImageUpload
        label="Imagen de portada"
        name="cover_image"
        defaultValue={montaje?.cover_image}
        folder="montajes"
        hint="Foto de la miniatura en el listado de montajes. Aspect ratio 16:10 recomendado."
        focalName="cover_image_focal"
        focalDefaultValue={montaje?.cover_image_focal}
        focalMobileName="cover_image_focal_mobile"
        focalMobileDefaultValue={montaje?.cover_image_focal_mobile}
      />

      <ImageUpload
        label="Imagen de banner (detalle)"
        name="banner_image"
        defaultValue={montaje?.banner_image ?? undefined}
        folder="montajes"
        hint="Foto grande que va detrás del título en la página de detalle. Si no se carga, se usa la imagen de portada."
        focalName="banner_image_focal"
        focalDefaultValue={montaje?.banner_image_focal}
        focalMobileName="banner_image_focal_mobile"
        focalMobileDefaultValue={montaje?.banner_image_focal_mobile}
      />

      <StringList
        label="Tags"
        name="tags"
        defaultValue={montaje?.tags ?? []}
        placeholder="Ej: Industrial"
        hint="Etiquetas que se muestran debajo del título en el listado y en la página de detalle."
      />

      <Checkbox label="Publicado" name="published" defaultChecked={montaje?.published ?? true} hint="Si está destildado, no se muestra en el sitio público." />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
