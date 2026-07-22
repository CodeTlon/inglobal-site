'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { changePassword } from '@/app/actions/auth'
import { Loader2, KeyRound, AlertCircle } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-igb-yellow text-igb-on-yellow py-3 rounded-md font-headline font-bold text-sm hover:brightness-95 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
      {pending ? 'Guardando…' : 'Cambiar contraseña'}
    </button>
  )
}

export default function CambiarPasswordForm({ forced }: { forced: boolean }) {
  const [state, action] = useFormState(changePassword, null)

  return (
    <div className="bg-white rounded-2xl p-8 shadow-igb-lg border border-zinc-100">
      <h1 className="text-xl font-headline font-bold text-zinc-900 mb-1">
        {forced ? 'Elegí una contraseña nueva' : 'Cambiar contraseña'}
      </h1>
      <p className="text-sm text-zinc-500 mb-6">
        {forced
          ? 'Tu contraseña es temporal — elegí una nueva para poder seguir usando el panel.'
          : 'Vas a tener que volver a iniciar sesión con la contraseña nueva.'}
      </p>

      {state?.error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{state.error}</p>
        </div>
      )}

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
            Contraseña nueva
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="••••••••"
            className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-igb-yellow/50 focus:border-igb-yellow-dark transition-colors"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
            Repetir contraseña
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={6}
            placeholder="••••••••"
            className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-igb-yellow/50 focus:border-igb-yellow-dark transition-colors"
          />
        </div>

        <SubmitButton />
      </form>
    </div>
  )
}
