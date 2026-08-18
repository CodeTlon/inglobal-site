'use client'

import { useFormState } from 'react-dom'
import { updateSiteSettings } from '@/app/actions/settings'
import { TextField, TextArea, NumberField, ImageUpload, VideoUpload } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import { AlertCircle } from 'lucide-react'
import InlineSavedBanner from '@/components/dashboard/InlineSavedBanner'

const action = updateSiteSettings.bind(null, 'hero')

export default function HeroForm({ settings }: { settings: Record<string, unknown> }) {
  const [state, formAction] = useFormState(action, null)

  return (
    <form action={formAction} className="space-y-6">
      <InlineSavedBanner trigger={state} />
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
        maxLength={100}
        placeholder="Elevando tus proyectos con seguridad y precisión."
        hint="El texto completo del h1. Máximo 100 caracteres."
      />

      <TextField
        label="Palabra a resaltar"
        name="highlight_word"
        defaultValue={(settings.highlight_word as string) || 'seguridad'}
        placeholder="seguridad"
        hint="Esa palabra (si aparece dentro del titular) se pinta de azul. Dejar vacío para no resaltar nada."
      />

      <TextArea
        label="Descripción"
        name="subheadline"
        defaultValue={settings.subheadline as string}
        rows={3}
        hint="Párrafo descriptivo debajo del titular."
        placeholder="Ej: Contamos con la flota y la experiencia para acompañar tus proyectos de izaje, montaje y transporte pesado."
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
        label="Video de fondo — desktop (MP4)"
        name="video_url"
        defaultValue={settings.video_url as string | null}
        folder="hero"
        focalName="video_focal"
        focalDefaultValue={settings.video_focal as string | null}
        hint="Opcional. Si hay video, reemplaza la imagen estática. Se respeta prefers-reduced-motion."
      />

      <VideoUpload
        label="Video de fondo — mobile (MP4, opcional)"
        name="video_url_mobile"
        defaultValue={settings.video_url_mobile as string | null}
        folder="hero"
        hint="Opcional. Si no se carga, en mobile se usa el mismo video de desktop."
      />

      <ImageUpload
        label="Imagen de fondo (fallback)"
        name="fallback_image"
        defaultValue={settings.fallback_image as string | null}
        folder="hero"
        hint="Se muestra cuando no hay video o el usuario prefiere movimiento reducido. También usada como poster del video."
      />

      <NumberField
        label="Opacidad del overlay (%)"
        name="overlay_opacity"
        defaultValue={(settings.overlay_opacity as number) ?? 100}
        min={0}
        max={100}
        hint="100 = look actual. Bajarlo aclara el degradé sobre el video/imagen del hero."
        placeholder="Ej: 100"
      />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
