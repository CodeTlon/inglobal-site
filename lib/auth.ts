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
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { bearer } from 'better-auth/plugins'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '@/db/schema'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/password'
import { consumirContador } from '@/lib/rate-limit'

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
  // Rate limit de Better Auth, con los contadores en Postgres (lib/rate-limit.ts: compartidos entre instancias y
  // sobreviven a un reinicio). El default del login es 3 intentos cada 10 s por IP, demasiado corto para una
  // oficina detrás de un mismo NAT: 10 por minuto sigue frenando fuerza bruta sin trabar a quien se equivoca de tecla.
  rateLimit: {
    window: 60,
    max: 100,
    customRules: { '/sign-in/email': { window: 60, max: 10 } },
    customStorage: {
      consume: async (key, rule) => {
        const r = await consumirContador(`ba:${key}`, rule.window, rule.max)
        return { allowed: r.permitido, retryAfter: r.permitido ? null : r.reintentarEnSeg }
      },
    },
  },
  // Segundo freno del login, por cuenta y no por IP: la IP la puede variar quien ataca, el email no. 20 intentos
  // cada 15 minutos por email alcanza para una persona que se equivoca y corta la fuerza bruta contra una cuenta.
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== '/sign-in/email') return
      const email = typeof ctx.body?.email === 'string' ? ctx.body.email.trim().toLowerCase() : ''
      if (!email) return
      const { permitido } = await consumirContador(`login-email:${email}`, 15 * 60, 20)
      if (!permitido) throw new APIError('TOO_MANY_REQUESTS', { message: 'Demasiados intentos para esta cuenta. Esperá unos minutos.' })
    }),
  },
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
