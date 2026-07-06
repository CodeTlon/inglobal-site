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
        <CreateUserForm />

        <div className="bg-white rounded-2xl p-6 shadow-igb border border-zinc-100">
          <h2 className="font-headline font-bold text-zinc-900 mb-4">Cuentas existentes</h2>

          {error && <p className="text-sm text-red-600">{error.message}</p>}

          <div className="divide-y divide-zinc-100">
            {users.map((u) => (
              <div key={u.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-zinc-900">{u.email}</p>
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
