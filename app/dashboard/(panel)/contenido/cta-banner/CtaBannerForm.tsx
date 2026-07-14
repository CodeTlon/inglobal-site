'use client'

import { useFormState } from 'react-dom'
import { updateSiteSettings } from '@/app/actions/settings'
import { TextField, TextArea, ImageUpload } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import { AlertCircle } from 'lucide-react'
import InlineSavedBanner from '@/components/dashboard/InlineSavedBanner'

const action = updateSiteSettings.bind(null, 'cta_banner')

export default function CtaBannerForm({ settings }: { settings: Record<string, unknown> }) {
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

      <TextField label="Título" name="heading" defaultValue={settings.heading as string} placeholder="Ingeniería aplicada a montajes complejos" />
      <TextArea label="Subtítulo" name="subheading" defaultValue={settings.subheading as string} rows={3} />

      <div className="grid grid-cols-2 gap-4">
        <TextField label="CTA primario" name="cta_primary" defaultValue={settings.cta_primary as string} placeholder="Solicitar Cotización" />
        <TextField label="CTA secundario" name="cta_secondary" defaultValue={settings.cta_secondary as string} placeholder="Ver Montajes" />
      </div>

      <ImageUpload
        label="Imagen de fondo"
        name="background_image"
        defaultValue={settings.background_image as string | null}
        folder="cta-banner"
        hint="Se muestra con opacidad 30% sobre fondo oscuro."
      />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
