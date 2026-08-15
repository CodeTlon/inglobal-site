'use client'

import { useFormState } from 'react-dom'
import { updateSiteSettings } from '@/app/actions/settings'
import { TextField, TextArea } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import { AlertCircle } from 'lucide-react'
import InlineSavedBanner from '@/components/dashboard/InlineSavedBanner'

const action = updateSiteSettings.bind(null, 'contacto_header')

export default function ContactoHeaderForm({ settings }: { settings: Record<string, unknown> }) {
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

      <TextField label="Label (etiqueta)" name="label" defaultValue={settings.label as string} placeholder="Contacto Directo" />
      <TextArea
        label="Título (h1)"
        name="heading"
        defaultValue={settings.heading as string}
        rows={2}
        hint={'Salto de línea = corte de línea en el título. Ej: "Hablemos de su" en una línea y "próximo proyecto." en la siguiente.'}
        placeholder={'Hablemos de su\npróximo proyecto.'}
      />
      <TextArea
        label="Subtítulo"
        name="subheading"
        defaultValue={settings.subheading as string}
        rows={2}
        placeholder="Asesoramiento técnico especializado para operaciones de alta complejidad."
      />
      <TextField label="Título del formulario" name="form_title" defaultValue={settings.form_title as string} placeholder="Envianos tu consulta" />
      <TextField label="Subtítulo del formulario" name="form_subtitle" defaultValue={settings.form_subtitle as string} placeholder="Complete el formulario y un asesor técnico le responderá a la brevedad." />
      <TextField label="Link de WhatsApp" name="whatsapp" defaultValue={settings.whatsapp as string} placeholder="https://wa.me/5493513454244" hint="URL completa, con https://" />
      <TextField label="Link de Instagram" name="instagram" defaultValue={settings.instagram as string} placeholder="https://www.instagram.com/gruasinglobal" hint="URL completa, con https://" />
      <TextField label="Label de la sección del mapa" name="map_label" defaultValue={settings.map_label as string} placeholder="Dónde Encontrarnos" />
      <TextField label="Título de la sección del mapa" name="map_heading" defaultValue={settings.map_heading as string} placeholder="Nuestra Ubicación" />
      <TextField label="Subtítulo de la sección del mapa" name="map_subheading" defaultValue={settings.map_subheading as string} placeholder="Acercate a nuestras oficinas o contactanos para planificar tu próximo movimiento." />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
