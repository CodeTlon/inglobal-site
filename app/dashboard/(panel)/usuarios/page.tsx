import Link from 'next/link'
import { KeyRound } from 'lucide-react'
import PageHeader from '@/components/dashboard/PageHeader'
import { createSupabaseAdminClient } from '@/lib/supabase-server'
import CreateUserForm from './CreateUserForm'
import ResetPasswordForm from './ResetPasswordForm'

export const dynamic = 'force-dynamic'

export default async function UsuariosPage() {
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin.auth.admin.listUsers()
  const users = data?.users ?? []

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Usuarios"
        description="Cuentas con acceso al panel. Sin signup público: las cuentas se crean desde acá."
      />

      <div className="space-y-6">
        <Link
          href="/dashboard/cambiar-password"
          className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-igb border border-zinc-100 hover:border-igb-yellow/40 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-igb-yellow/10 flex items-center justify-center flex-shrink-0">
            <KeyRound size={16} className="text-igb-yellow-dark" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900">Cambiar mi contraseña</p>
            <p className="text-xs text-zinc-400">Cambiá la clave de tu propia cuenta en cualquier momento.</p>
          </div>
        </Link>

        <CreateUserForm />

        <div className="bg-white rounded-2xl p-6 shadow-igb border border-zinc-100">
          <h2 className="font-headline font-bold text-zinc-900 mb-4">Cuentas existentes</h2>

          {error && <p className="text-sm text-red-600">{error.message}</p>}

          <div className="divide-y divide-zinc-100">
            {users.map((u) => (
              <div key={u.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-zinc-900">{u.email}</p>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                        u.app_metadata?.role === 'trabajador'
                          ? 'bg-zinc-100 text-zinc-500'
                          : 'bg-igb-yellow/15 text-igb-yellow-dark'
                      }`}
                    >
                      {u.app_metadata?.role === 'trabajador' ? 'Trabajador' : 'Admin'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Último ingreso: {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString('es-AR') : 'nunca'}
                  </p>
                </div>
                <ResetPasswordForm userId={u.id} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
