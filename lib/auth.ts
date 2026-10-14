/**
 * lib/auth.ts — Better Auth (reemplaza a Supabase Auth).
 *
 * - Email + contraseña, SIN signup público: las cuentas las crea un usuario
 *   logueado desde /dashboard/usuarios (app/actions/users.ts).
 * - Un solo tipo de cuenta (sin roles): cualquier cuenta autenticada tiene
 *   acceso total al panel y a la app mobile. Ver .ai/context/DECISIONS.md.
 * - Plugin `bearer`: la app mobile manda `Authorization: Bearer <token>` y el
 *   token llega en el header `set-auth-token` al loguearse.
 * - `nextCookies()` siempre último: permite setear cookies desde Server Actions.
 */

import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { bearer } from 'better-auth/plugins'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '@/db/schema'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/password'

// Durante `next build` no hay secretos reales; en runtime Better Auth exige uno.
const secret =
  process.env.BETTER_AUTH_SECRET ??
  (process.env.NEXT_PHASE === 'phase-production-build' ? 'build-placeholder-secret-no-usar-en-runtime' : undefined)

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret,
  database: drizzleAdapter(drizzle({ client: db.pool(), schema }), { provider: 'pg', schema }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 6,
    password: {
      hash: hashPassword,
      verify: ({ hash, password }) => verifyPassword(password, hash),
    },
  },
  user: {
    additionalFields: {
      // Contraseña temporal: solo el servidor la modifica (input:false).
      mustChangePassword: { type: 'boolean', required: false, defaultValue: false, input: false },
      lastSignInAt: { type: 'date', required: false, input: false },
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean),
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          await db.from('user').update({ last_sign_in_at: new Date().toISOString() }).eq('id', session.userId)
        },
      },
    },
  },
  plugins: [bearer(), nextCookies()],
})
