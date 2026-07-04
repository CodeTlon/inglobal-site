'use client'

import { useFormState } from 'react-dom'
import { updateSiteSettings } from '@/app/actions/settings'
import { StatsList } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import { CheckCircle, AlertCircle } from 'lucide-react'

const action = updateSiteSettings.bind(null, 'stats')

const defaultStats = [
  { number: '40+', label: 'Años de experiencia' },
  { number: '200t', label: 'Toneladas de capacidad' },
  { number: '100m', label: 'Altura máxima' },
]

export default function StatsForm({ settings }: { settings: Record<string, unknown> }) {
  const [state, formAction] = useFormState(action, null)
  const items = Array.isArray(settings.items)
    ? (settings.items as { number: string; label: string }[])
    : defaultStats

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

      <StatsList
        label="Indicadores"
        name="items"
        defaultValue={items}
        hint="Número (izq) + etiqueta (der). Recomendado: máximo 3 stats."
      />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
