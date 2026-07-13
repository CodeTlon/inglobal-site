'use client'

import { useFormState } from 'react-dom'
import { updateSiteSettings } from '@/app/actions/settings'
import { CheckboxGroup } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import { QUICKLINK_CANDIDATES } from '@/lib/constants'
import { CheckCircle, AlertCircle } from 'lucide-react'

const action = updateSiteSettings.bind(null, 'dashboard_quicklinks')

export default function AccesosRapidosForm({ settings }: { settings: Record<string, unknown> }) {
  const [state, formAction] = useFormState(action, null)
  // Compat: versiones previas guardaban {href,label}[] en vez de href[].
  const rawItems = Array.isArray(settings.items) ? settings.items : []
  const selectedHrefs = rawItems.map((it) => (typeof it === 'string' ? it : (it as { href: string }).href))

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

      <CheckboxGroup
        label="Accesos rápidos"
        name="items"
        options={QUICKLINK_CANDIDATES.map((c) => ({ value: c.href, label: c.label }))}
        defaultValue={selectedHrefs}
        hint="Elegí cuáles aparecen como cards en el inicio del panel."
      />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
