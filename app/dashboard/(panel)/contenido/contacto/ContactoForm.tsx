'use client'

import { useFormState } from 'react-dom'
import { updateSiteSettings } from '@/app/actions/settings'
import { TextField, TextArea } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import { CheckCircle, AlertCircle } from 'lucide-react'

const action = updateSiteSettings.bind(null, 'contacto')

export default function ContactoForm({ settings }: { settings: Record<string, unknown> }) {
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

      <TextField label="Teléfono" name="phone" defaultValue={settings.phone as string} placeholder="0351 345-4244" type="tel" />

      <TextArea
        label="Dirección"
        name="address"
        defaultValue={settings.address as string}
        rows={2}
        placeholder={'Ana Riglos de Irigoyen S/N\nCórdoba, Argentina'}
        hint="Usá salto de línea para separar calle de ciudad."
      />

      <TextField label="Email" name="email" defaultValue={settings.email as string} placeholder="info@gruasinglobal.com" type="email" />

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Horario semana"
          name="hours_weekday"
          defaultValue={settings.hours_weekday as string}
          placeholder="Lun-Vie 8:00 — 18:00h"
        />
        <TextField
          label="Horario sábado"
          name="hours_saturday"
          defaultValue={settings.hours_saturday as string}
          placeholder="Sáb 8:00 — 13:00h"
        />
      </div>

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
