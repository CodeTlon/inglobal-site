'use client'

import { useFormState } from 'react-dom'
import { updateSiteSettings } from '@/app/actions/settings'
import { TextField, TextArea } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import { AlertCircle } from 'lucide-react'
import InlineSavedBanner from '@/components/dashboard/InlineSavedBanner'

const action = updateSiteSettings.bind(null, 'contacto')

export default function ContactoForm({ settings }: { settings: Record<string, unknown> }) {
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

      <TextField label="Teléfono" name="phone" defaultValue={settings.phone as string} placeholder="0351 345-4244" type="tel" />

      <TextField label="Teléfono secundario" name="phone_secondary" defaultValue={settings.phone_secondary as string} placeholder="0351 645-0657" type="tel" hint="Opcional." />

      <TextArea
        label="Dirección"
        name="address"
        defaultValue={settings.address as string}
        rows={2}
        placeholder={'Ana Riglos de Irigoyen S/N\nCórdoba, Argentina'}
        hint="Usá salto de línea para separar calle de ciudad."
      />

      <TextField label="Email" name="email" defaultValue={settings.email as string} placeholder="cotizacionesinglobalsrl@gmail.com" type="email" />

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
