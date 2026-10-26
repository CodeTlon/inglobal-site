#!/usr/bin/env node
// `npm run dev:local`: Next.js contra el Postgres + MinIO locales (docker compose), sin tocar ningún .env.
// Las variables se inyectan al proceso, así que no hay forma de escribir contra test o producción por error.
import { spawn } from 'node:child_process'

const dbPort = process.env.DB_PORT ?? '41510'
const s3Port = process.env.MINIO_PORT ?? '41511'
const port = process.env.PORT ?? '3200'

console.log(`[dev:local] Postgres 127.0.0.1:${dbPort}  ·  MinIO 127.0.0.1:${s3Port}  ·  sitio http://localhost:${port}`)

spawn('npx', ['next', 'dev', '-p', port], {
  stdio: 'inherit',
  // shell: true por Windows — ahí `npx` es `npx.cmd` y `spawn` sin shell no
  // resuelve la extensión: tiraba ENOENT y el script no arrancaba nunca.
  shell: true,
  env: {
    ...process.env,
    DATABASE_URL: `postgres://inglobal:inglobal@127.0.0.1:${dbPort}/inglobal`,
    BETTER_AUTH_SECRET: 'secreto-local-solo-desarrollo-0123456789',
    BETTER_AUTH_URL: `http://localhost:${port}`,
    S3_ENDPOINT: `http://127.0.0.1:${s3Port}`,
    S3_BUCKET: 'media',
    S3_ACCESS_KEY_ID: 'inglobal',
    S3_SECRET_ACCESS_KEY: 'inglobal-secret',
    STORAGE_PUBLIC_URL: `http://127.0.0.1:${s3Port}/media`,
    CRON_SECRET: 'cron-local',
  },
})
