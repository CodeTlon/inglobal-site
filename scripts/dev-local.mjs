#!/usr/bin/env node
// `npm run dev:local`: Next.js contra el Supabase LOCAL, sin tocar ningún .env.
// Las variables se inyectan al proceso (tienen prioridad sobre .env.local/.env.development.local),
// así que no hay forma de que esto escriba contra homologación o producción por error.
import { execSync, spawn } from 'node:child_process'

const env = {}
for (const line of execSync('npx supabase status -o env', { encoding: 'utf8' }).split('\n')) {
  const m = line.match(/^([A-Z_]+)="?(.*?)"?$/)
  if (m) env[m[1]] = m[2]
}
if (!env.API_URL || !env.ANON_KEY || !env.SERVICE_ROLE_KEY) {
  throw new Error('El stack local no está corriendo. Ejecutá `npm run db:local:up`.')
}
if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(env.API_URL)) {
  throw new Error(`Abortado: ${env.API_URL} no es un Supabase local.`)
}

const port = process.env.PORT ?? '3200'
console.log(`[dev:local] Supabase ${env.API_URL}  ·  sitio http://localhost:${port}`)

const child = spawn('npx', ['next', 'dev', '-p', port], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: env.API_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: env.SERVICE_ROLE_KEY,
  },
})
child.on('exit', (code) => process.exit(code ?? 0))
