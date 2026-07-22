'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { KeyRound, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { resetAdminPassword } from '@/app/actions/users'
import { fieldInput } from '@/components/dashboard/Field'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 bg-zinc-100 text-zinc-700 px-3 py-2 rounded-md text-xs font-bold hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? <Loader2 size={13} className="animate-spin" /> : <KeyRound size={13} />}
      {pending ? 'Cambiando…' : 'Cambiar'}
    </button>
  )
}

export default function ResetPasswordForm({ userId }: { userId: string }) {
  const [state, action] = useFormState(resetAdminPassword, undefined)
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-igb-yellow-dark hover:text-igb-on-surface transition-colors"
      >
        <KeyRound size={13} /> Resetear contraseña
      </button>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="userId" value={userId} />
      <div className="flex items-center gap-2">
        <input
          type="password"
          name="password"
          required
          minLength={6}
          placeholder="Nueva contraseña (mín. 6)"
          className={`${fieldInput} !py-1.5 !text-xs max-w-[220px]`}
        />
        <SubmitButton />
      </div>
      {state?.error && (
        <p className="flex items-center gap-1 text-xs text-red-600"><AlertCircle size={12} />{state.error}</p>
      )}
      {state?.success && (
        <p className="flex items-center gap-1 text-xs text-green-600"><CheckCircle2 size={12} />Contraseña actualizada.</p>
      )}
    </form>
  )
}
