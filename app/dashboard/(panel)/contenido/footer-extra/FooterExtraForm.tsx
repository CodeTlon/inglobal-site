'use client'

import { useFormState } from 'react-dom'
import { updateSiteSettings } from '@/app/actions/settings'
import { TextField } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import { AlertCircle } from 'lucide-react'
import InlineSavedBanner from '@/components/dashboard/InlineSavedBanner'

const action = updateSiteSettings.bind(null, 'footer_extra')

export default function FooterExtraForm({ settings }: { settings: Record<string, unknown> }) {
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

      <TextField label="Encabezado de la columna de navegación" name="nav_heading" defaultValue={settings.nav_heading as string} placeholder="Navegación" />
      <TextField label="Encabezado de la columna de contacto" name="contact_heading" defaultValue={settings.contact_heading as string} placeholder="Atención Comercial" />
      <TextField label="Nombre en el copyright" name="copyright_name" defaultValue={settings.copyright_name as string} placeholder="Grúas InGlobal S.R.L." hint={'Se muestra como: © 2026 <este texto> — Todos los derechos reservados.'} />
      <TextField label="Link legal 1" name="aviso_legal" defaultValue={settings.aviso_legal as string} placeholder="Aviso Legal" />
      <TextField label="Link legal 2" name="politica_privacidad" defaultValue={settings.politica_privacidad as string} placeholder="Política de Privacidad" />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
