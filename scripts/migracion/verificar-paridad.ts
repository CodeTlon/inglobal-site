/**
 * Verifica que la base y el bucket de destino quedaron IDÉNTICOS al backup de
 * producción de Supabase (mismo BACKUP_DIR que usó importar-prod.ts).
 *
 *   BACKUP_DIR=... DATABASE_URL=... STORAGE_PUBLIC_URL=https://.../media \
 *   [SITE_URL=https://test.gruasinglobal.com] npx tsx scripts/migracion/verificar-paridad.ts
 *
 * Chequea:
 *  1. Cada tabla de negocio: mismas filas (comparadas fila por fila como JSON, con las URLs
 *     de storage reescritas a la base nueva).
 *  2. Usuarios: mismos ids, emails y hash bcrypt.
 *  3. Archivos: los 27 objetos del bucket existen y su sha256 coincide con el manifiesto.
 *  4. (opcional) SITE_URL: páginas públicas responden 200 y /api/health está ok.
 * Sale con código 1 si algo no coincide.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { Pool } from 'pg'

const dir = process.env.BACKUP_DIR as string
const publicBase = (process.env.STORAGE_PUBLIC_URL ?? '').replace(/\/$/, '')
// Desde dentro de la red del compose la URL pública no es alcanzable: STORAGE_FETCH_URL = http://minio:9000/media
const fetchBase = (process.env.STORAGE_FETCH_URL ?? publicBase).replace(/\/$/, '')
if (!dir || !publicBase) throw new Error('Faltan BACKUP_DIR y STORAGE_PUBLIC_URL')

const SUPABASE_PUBLIC = /https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/media\//g
const TABLAS = [
  'site_settings', 'contact_leads', 'clientes', 'montajes', 'servicios', 'trabajos', 'galeria',
  'gruas', 'empresas_agenda', 'operarios', 'eventos_agenda', 'eventos_operarios', 'tv_pairing_codes',
]

let fallas = 0
const ok = (m: string) => console.log(`  ok    ${m}`)
const fail = (m: string) => { fallas++; console.log(`  FALLA ${m}`) }

const stable = (v: unknown): string => JSON.stringify(v, (_k, x) =>
  x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b))) : x)

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })

  console.log('\n[1] Tablas de negocio')
  for (const t of TABLAS) {
    const esperado = JSON.parse(fs.readFileSync(path.join(dir, 'tablas', `${t}.json`), 'utf8').replace(SUPABASE_PUBLIC, `${publicBase}/`)) as Record<string, unknown>[]
    const { rows } = await pool.query(`select to_jsonb(t) as r from "${t}" t`)
    let actual = rows.map((x) => x.r as Record<string, unknown>)
    // tv_pairing_codes.approved_by pasó de uuid a text: mismo valor, mismo JSON.
    const key = (r: Record<string, unknown>) => String(r.id ?? r.key ?? `${r.evento_id}:${r.operario_id}`)
    const a = new Map(actual.map((r) => [key(r), stable(r)]))
    const e = new Map(esperado.map((r) => [key(r), stable(r)]))
    const distintos = [...e.keys()].filter((k) => a.get(k) !== e.get(k))
    const sobran = [...a.keys()].filter((k) => !e.has(k))
    if (a.size === e.size && distintos.length === 0 && sobran.length === 0) ok(`${t}: ${e.size} filas idénticas`)
    else fail(`${t}: esperado ${e.size}, actual ${a.size}, distintas ${distintos.length}, de más ${sobran.length}`)
    actual = []
  }

  console.log('\n[2] Usuarios (id, email, hash bcrypt)')
  const users = JSON.parse(fs.readFileSync(path.join(dir, 'auth_users.json'), 'utf8')) as { id: string; email: string; encrypted_password: string }[]
  for (const u of users) {
    const { rows } = await pool.query(
      `select a.password from "user" u join account a on a.user_id = u.id and a.provider_id = 'credential' where u.id = $1 and u.email = $2`,
      [u.id, u.email.toLowerCase()],
    )
    if (rows[0]?.password === u.encrypted_password) ok(`usuario ${u.email.split('@')[0].slice(0, 3)}***: id, email y hash iguales`)
    else fail(`usuario ${u.email.split('@')[0].slice(0, 3)}***: no coincide`)
  }
  const { rows: cnt } = await pool.query(`select count(*)::int n from "user"`)
  if (cnt[0].n >= users.length) ok(`cuentas en destino: ${cnt[0].n} (backup: ${users.length})`)
  else fail(`cuentas en destino: ${cnt[0].n}, backup: ${users.length}`)
  await pool.end()

  console.log('\n[3] Archivos del bucket (sha256)')
  const manifiesto = JSON.parse(fs.readFileSync(path.join(dir, 'storage_manifiesto.json'), 'utf8')) as { name: string; bytes: number; sha256: string }[]
  let okFiles = 0
  for (const m of manifiesto) {
    const res = await fetch(`${fetchBase}/${m.name.split('/').map(encodeURIComponent).join('/')}`).catch(() => null)
    if (!res?.ok) { fail(`archivo ${m.name}: HTTP ${res?.status ?? 'sin respuesta'}`); continue }
    const sha = crypto.createHash('sha256').update(Buffer.from(await res.arrayBuffer())).digest('hex')
    if (sha === m.sha256) okFiles++
    else fail(`archivo ${m.name}: sha256 distinto`)
  }
  if (okFiles === manifiesto.length) ok(`${okFiles}/${manifiesto.length} archivos idénticos`)

  if (process.env.SITE_URL) {
    console.log('\n[4] Sitio')
    const site = process.env.SITE_URL.replace(/\/$/, '')
    for (const p of ['/api/health', '/', '/servicios', '/montajes', '/clientes', '/galeria', '/contacto', '/sitemap.xml']) {
      const res = await fetch(site + p, { redirect: 'manual' }).catch(() => null)
      if (res?.status === 200) ok(`${p} 200`)
      else fail(`${p} -> ${res?.status ?? 'sin respuesta'}`)
    }
  }

  console.log(fallas === 0 ? '\nPARIDAD COMPLETA: el destino es idéntico al backup de producción.' : `\n${fallas} diferencia(s). El destino NO es idéntico.`)
  process.exit(fallas === 0 ? 0 : 1)
}
main().catch((e) => { console.error(e); process.exit(1) })
