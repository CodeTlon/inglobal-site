'use client'

import { useFormState } from 'react-dom'
import { updateSiteSettings } from '@/app/actions/settings'
import { TextField } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import { AlertCircle } from 'lucide-react'
import InlineSavedBanner from '@/components/dashboard/InlineSavedBanner'

const action = updateSiteSettings.bind(null, 'navbar')

// Mismo orden e ids que BASE_NAV_LINKS en components/Navbar.tsx — la ruta de
// cada uno queda fija en código, acá solo se edita el texto visible.
const ITEMS: { id: string; route: string; placeholder: string }[] = [
  { id: 'index', route: '/', placeholder: 'Inicio' },
  { id: 'quienes-somos', route: '/quienes-somos', placeholder: 'Quiénes Somos' },
  { id: 'servicios', route: '/servicios', placeholder: 'Servicios' },
  { id: 'montajes', route: '/montajes', placeholder: 'Montajes' },
  { id: 'galeria', route: '/galeria', placeholder: 'Galería' },
  { id: 'clientes', route: '/clientes', placeholder: 'Clientes' },
  { id: 'contacto', route: '/contacto', placeholder: 'Contacto' },
]

export default function NavbarForm({ settings }: { settings: Record<string, unknown> }) {
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

      {ITEMS.map((item) => (
        <TextField
          key={item.id}
          label={`Link a ${item.route}`}
          name={item.id}
          defaultValue={settings[item.id] as string}
          placeholder={item.placeholder}
        />
      ))}

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
