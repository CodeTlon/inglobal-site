'use client'

import { useFormState } from 'react-dom'
import { updateSiteSettings } from '@/app/actions/settings'
import { TextField, TextArea } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import { AlertCircle } from 'lucide-react'
import InlineSavedBanner from '@/components/dashboard/InlineSavedBanner'

const action = updateSiteSettings.bind(null, 'clientes_cta')

export default function ClientesCtaForm({ settings }: { settings: Record<string, unknown> }) {
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

      <TextField label="Título" name="heading" defaultValue={settings.heading as string} placeholder="¿Querés trabajar con nosotros?" />
      <TextArea
        label="Subtítulo"
        name="subheading"
        defaultValue={settings.subheading as string}
        rows={3}
        placeholder="Somos una PyME con una gran fortaleza humana donde construimos relaciones comerciales excelentes y duraderas."
      />
      <TextField label="Texto del botón" name="button" defaultValue={settings.button as string} placeholder="Contactar ahora" />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
