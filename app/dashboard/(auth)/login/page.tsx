'use client'

import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useFormState, useFormStatus } from 'react-dom'
import { signIn } from '@/app/actions/auth'
import { Loader2, LogIn, AlertCircle } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-igb-yellow text-igb-on-yellow py-3 rounded-md font-headline font-bold text-sm hover:brightness-95 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {pending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogIn className="w-4 h-4" />
      )}
      {pending ? 'Iniciando sesión…' : 'Iniciar sesión'}
    </button>
  )
}

export default function LoginPage() {
  const [state, action] = useFormState(signIn, null)
  const sinAcceso = useSearchParams().get('sin_acceso') === '1'

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <Image
          src="/images/logo.webp"
          alt="Grúas InGlobal S.R.L."
          width={160}
          height={50}
          className="h-12 w-auto object-contain"
          sizes="160px"
        />
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-igb-lg border border-zinc-100">
        <h1 className="text-xl font-headline font-bold text-zinc-900 mb-1">
          Panel de administración
        </h1>
        <p className="text-sm text-zinc-500 mb-6">
          Ingresá con tu cuenta para continuar.
        </p>

        {state?.error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{state.error}</p>
          </div>
        )}
        {!state?.error && sinAcceso && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-amber-700 text-sm">
              Tu cuenta es de trabajador: el calendario se usa desde la app InGlobal Agenda, no desde este panel.
            </p>
          </div>
        )}

        <form action={action} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="admin@gruasinglobal.com"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-igb-yellow/50 focus:border-igb-yellow-dark transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-igb-yellow/50 focus:border-igb-yellow-dark transition-colors"
            />
          </div>

          <SubmitButton />
        </form>
      </div>
    </div>
  )
}
