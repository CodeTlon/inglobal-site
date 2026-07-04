'use client'

import { useFormState } from 'react-dom'
import { updateSiteSettings } from '@/app/actions/settings'
import { TextField, TextArea, ImageUpload, VideoUpload } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import { CheckCircle, AlertCircle } from 'lucide-react'

const action = updateSiteSettings.bind(null, 'hero')

export default function HeroForm({ settings }: { settings: Record<string, any> }) {
  const [state, formAction] = useFormState(action, null)

  return (
    <form action={formAction} className="space-y-6">
      {state?.success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-700 text-sm font-medium">Cambios guardados correctamente.</p>
        </div>
      )}
      {state?.error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{state.error}</p>
        </div>
      )}

      <TextField
        label="Titular (headline)"
        name="headline"
        defaultValue={settings.headline as string}
        placeholder="Elevando tus proyectos con seguridad y precisión."
        hint="El texto completo del h1. La palabra 'seguridad' se resalta automáticamente en amarillo."
      />

      <TextArea
        label="Descripción"
        name="subheadline"
        defaultValue={settings.subheadline as string}
        rows={3}
        hint="Párrafo descriptivo debajo del titular."
      />

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="CTA primario"
          name="cta_primary"
          defaultValue={settings.cta_primary as string}
          placeholder="Solicitar Presupuesto"
        />
        <TextField
          label="CTA secundario"
          name="cta_secondary"
          defaultValue={settings.cta_secondary as string}
          placeholder="Ver Servicios"
        />
      </div>

      <VideoUpload
        label="Video de fondo (MP4)"
        name="video_url"
        defaultValue={settings.video_url as string | null}
        folder="hero"
        hint="Opcional. Si hay video, reemplaza la imagen estática. Se respeta prefers-reduced-motion."
      />

      <ImageUpload
        label="Imagen de fondo (fallback)"
        name="fallback_image"
        defaultValue={settings.fallback_image as string | null}
        folder="hero"
        hint="Se muestra cuando no hay video o el usuario prefiere movimiento reducido. También usada como poster del video."
      />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
