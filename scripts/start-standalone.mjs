#!/usr/bin/env node
// Sirve el build `output: 'standalone'` (lo que corre en el contenedor) en local: copia
// public/, .next/static/ y drizzle/ dentro del standalone, que Next no incluye solo, y arranca server.js.
// Uso: node scripts/start-standalone.mjs [puerto]
import { cpSync, existsSync } from 'node:fs'
import { spawn } from 'node:child_process'

const standalone = '.next/standalone'
if (!existsSync(`${standalone}/server.js`)) {
  console.error('Falta el build standalone: corré `npm run build` primero.')
  process.exit(1)
}
cpSync('public', `${standalone}/public`, { recursive: true })
cpSync('.next/static', `${standalone}/.next/static`, { recursive: true })
// instrumentation.ts aplica las migraciones desde ./drizzle (relativo al cwd del standalone).
cpSync('drizzle', `${standalone}/drizzle`, { recursive: true })

const port = process.argv[2] ?? process.env.PORT ?? '3000'
const child = spawn('node', [`${standalone}/server.js`], {
  stdio: 'inherit',
  env: { ...process.env, PORT: port, HOSTNAME: process.env.HOSTNAME ?? '127.0.0.1' },
})
child.on('exit', (code) => process.exit(code ?? 0))
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => child.kill(sig))
