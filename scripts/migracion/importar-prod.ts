/**
 * Carga en la base y el bucket de destino el backup de producción de Supabase
 * (extraído con la API de gestión; ver .ai/context/MIGRACION_SUPABASE.md).
 *
 * Uso:
 *   BACKUP_DIR=/home/dev1/migracion-prod/2026-10-14 \
 *   DATABASE_URL=postgres://... \
 *   S3_ENDPOINT=http://127.0.0.1:41511 S3_BUCKET=media S3_ACCESS_KEY_ID=... S3_SECRET_ACCESS_KEY=... \
 *   STORAGE_PUBLIC_URL=http://127.0.0.1:41511/media \
 *   npx tsx scripts/migracion/importar-prod.ts [--reset]
 *
 * --reset vacía las tablas de negocio y de usuarios antes de cargar (idempotente).
 * Es solo para entornos de test/local: NO correr con --reset contra producción real
 * una vez que esté en uso.
 */

import fs from 'node:fs'
import path from 'node:path'
import { Pool } from 'pg'
import { S3Client, PutObjectCommand, CreateBucketCommand, HeadBucketCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3'

const SUPABASE_PUBLIC = /https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/media\//g

const dir = process.env.BACKUP_DIR as string
if (!dir) throw new Error('Falta BACKUP_DIR')
const publicBase = process.env.STORAGE_PUBLIC_URL
if (!publicBase) throw new Error('Falta STORAGE_PUBLIC_URL (base pública del bucket, sin barra final)')
const reset = process.argv.includes('--reset')

const read = (f: string) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
const rewrite = (s: string) => s.replace(SUPABASE_PUBLIC, `${publicBase!.replace(/\/$/, '')}/`)

// Orden respetando FK: padres primero.
const TABLAS = [
  'site_settings', 'contact_leads', 'clientes', 'montajes', 'servicios', 'trabajos', 'galeria',
  'gruas', 'empresas_agenda', 'operarios', 'eventos_agenda', 'eventos_operarios',
] as const

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const c = await pool.connect()
  try {
    await c.query('begin')

    if (reset) {
      await c.query(
        `truncate tv_pairing_codes, push_tokens, notificaciones_enviadas, eventos_operarios, eventos_agenda,
         trabajos, clientes, montajes, servicios, galeria, gruas, empresas_agenda, operarios, contact_leads,
         site_settings, session, account, verification, "user" restart identity cascade`,
      )
    }

    // ── Usuarios: mismo id, mismo hash bcrypt (login sin reset de contraseña) ──
    const users = read('auth_users.json') as {
      id: string; email: string; encrypted_password: string; email_confirmed_at: string | null
      created_at: string; last_sign_in_at: string | null; raw_user_meta_data: Record<string, unknown> | null
    }[]
    for (const u of users) {
      const meta = u.raw_user_meta_data ?? {}
      const name = (meta.name as string) || (meta.full_name as string) || u.email.split('@')[0]
      await c.query(
        `insert into "user" (id, name, email, email_verified, must_change_password, last_sign_in_at, created_at, updated_at)
         values ($1, $2, $3, $4, $5, $6, $7, $7)`,
        [u.id, name, u.email.toLowerCase(), !!u.email_confirmed_at, meta.must_change_password === true, u.last_sign_in_at, u.created_at],
      )
      await c.query(
        `insert into account (id, account_id, provider_id, user_id, password, created_at, updated_at)
         values ($1, $2, 'credential', $2, $3, $4, $4)`,
        [`cred_${u.id}`, u.id, u.encrypted_password, u.created_at],
      )
    }
    console.log(`usuarios: ${users.length}`)

    // ── Tablas de negocio: jsonb_populate_recordset convierte tipos desde el JSON ──
    const resumen: Record<string, number> = {}
    for (const t of TABLAS) {
      const rows = JSON.parse(rewrite(fs.readFileSync(path.join(dir, 'tablas', `${t}.json`), 'utf8')))
      if (rows.length) {
        await c.query(`insert into "${t}" select * from jsonb_populate_recordset(null::"${t}", $1::jsonb)`, [JSON.stringify(rows)])
      }
      resumen[t] = rows.length
    }
    // tv_pairing_codes: códigos efímeros; se cargan para paridad (approved_by ya es text)
    const tv = JSON.parse(fs.readFileSync(path.join(dir, 'tablas', 'tv_pairing_codes.json'), 'utf8'))
    if (tv.length) await c.query(`insert into tv_pairing_codes select * from jsonb_populate_recordset(null::tv_pairing_codes, $1::jsonb)`, [JSON.stringify(tv)])
    resumen.tv_pairing_codes = tv.length
    console.table(resumen)

    await c.query('commit')
  } catch (e) {
    await c.query('rollback')
    throw e
  } finally {
    c.release()
    await pool.end()
  }

  await subirArchivos()
}

async function subirArchivos() {
  const endpoint = process.env.S3_ENDPOINT
  const bucket = process.env.S3_BUCKET
  if (!endpoint || !bucket) {
    console.log('S3_ENDPOINT/S3_BUCKET sin definir: se omite la carga de archivos.')
    return
  }
  const s3 = new S3Client({
    endpoint,
    region: process.env.S3_REGION ?? 'us-east-1',
    forcePathStyle: true,
    credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID!, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY! },
  })
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }))
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: bucket }))
  }
  // Lectura pública de objetos (igual que el bucket `media` público de Supabase); escritura solo con credenciales.
  await s3.send(new PutBucketPolicyCommand({
    Bucket: bucket,
    Policy: JSON.stringify({
      Version: '2012-10-17',
      Statement: [{ Effect: 'Allow', Principal: '*', Action: ['s3:GetObject'], Resource: [`arn:aws:s3:::${bucket}/*`] }],
    }),
  }))
  const manifiesto = read('storage_objetos.json') as { name: string; mime: string }[]
  let n = 0
  for (const o of manifiesto) {
    const body = fs.readFileSync(path.join(dir, 'storage', o.name))
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: o.name, Body: body, ContentType: o.mime, CacheControl: 'public, max-age=3600' }))
    n++
  }
  console.log(`archivos subidos: ${n}/${manifiesto.length}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
