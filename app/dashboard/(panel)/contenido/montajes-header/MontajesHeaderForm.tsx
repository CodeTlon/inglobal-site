'use client'

import { useFormState } from 'react-dom'
import { updateSiteSettings } from '@/app/actions/settings'
import { TextField, TextArea } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import { AlertCircle } from 'lucide-react'
import InlineSavedBanner from '@/components/dashboard/InlineSavedBanner'

const action = updateSiteSettings.bind(null, 'montajes_header')

export default function MontajesHeaderForm({ settings }: { settings: Record<string, unknown> }) {
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

      <TextField label="Label (etiqueta)" name="label" defaultValue={settings.label as string} placeholder="Portafolio de Proyectos" />
      <TextField label="Título (h1)" name="heading" defaultValue={settings.heading as string} placeholder="Casos de Éxito" />
      <TextArea
        label="Subtítulo"
        name="subheading"
        defaultValue={settings.subheading as string}
        rows={3}
        hint="Párrafo de apoyo debajo del título."
        placeholder="Ingeniería aplicada a desafíos complejos. Cada proyecto es un testimonio de nuestra precisión técnica y compromiso con la seguridad."
      />
      <TextField label="Título del CTA final" name="cta_heading" defaultValue={settings.cta_heading as string} placeholder="¿Tu proyecto es el próximo desafío?" />
      <TextArea
        label="Subtítulo del CTA final"
        name="cta_subheading"
        defaultValue={settings.cta_subheading as string}
        rows={2}
        placeholder="Contactanos para recibir asesoramiento técnico especializado y presupuesto a medida."
      />
      <TextField label="Texto del botón del CTA final" name="cta_button" defaultValue={settings.cta_button as string} placeholder="Consultanos ahora" />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
