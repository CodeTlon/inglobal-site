'use client'

import { useFormState } from 'react-dom'
import { updateSiteSettings } from '@/app/actions/settings'
import { TextField, TextArea } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import { CheckCircle, AlertCircle } from 'lucide-react'

const action = updateSiteSettings.bind(null, 'que_hacemos')

export default function QueHacemosForm({ settings }: { settings: Record<string, unknown> }) {
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

      <TextField label="Label (etiqueta)" name="label" defaultValue={settings.label as string} placeholder="Excelencia Operativa" />
      <TextField label="Título (h2)" name="heading" defaultValue={settings.heading as string} placeholder="Ingeniería en Movimiento" />
      <TextArea
        label="Subtítulo"
        name="subheading"
        defaultValue={settings.subheading as string}
        rows={3}
        hint="Párrafo de apoyo debajo del título."
      />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
