'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { UserPlus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createAdminUser } from '@/app/actions/users'
import { fieldLabel, fieldInput } from '@/components/dashboard/Field'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 bg-igb-yellow text-igb-on-yellow px-5 py-2.5 rounded-md font-headline font-bold text-sm hover:brightness-95 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
      {pending ? 'Creando…' : 'Crear cuenta'}
    </button>
  )
}

export default function CreateUserForm() {
  const [state, action] = useFormState(createAdminUser, undefined)

  return (
    <form action={action} className="bg-white rounded-2xl p-6 shadow-igb border border-zinc-100 space-y-4">
      <h2 className="font-headline font-bold text-zinc-900">Nueva cuenta admin</h2>

      {state?.error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{state.error}</p>
        </div>
      )}
      {state?.success && (
        <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-700 text-sm">Cuenta creada. Pasale el email y la contraseña por fuera del sistema.</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className={fieldLabel}>Email</label>
          <input id="email" name="email" type="email" required placeholder="nombre@gruasinglobal.com" className={fieldInput} />
        </div>
        <div>
          <label htmlFor="password" className={fieldLabel}>Contraseña</label>
          <input id="password" name="password" type="password" required minLength={6} placeholder="mín. 6 caracteres" className={fieldInput} />
        </div>
        <div>
          <label htmlFor="role" className={fieldLabel}>Rol</label>
          <select id="role" name="role" defaultValue="admin" className={fieldInput}>
            <option value="admin">Admin (acceso total al panel)</option>
            <option value="trabajador">Trabajador (solo agenda, en la app)</option>
          </select>
        </div>
      </div>

      <SubmitButton />
    </form>
  )
}
