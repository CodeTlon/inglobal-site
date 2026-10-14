#!/usr/bin/env node
/**
 * Carga el backup de producción (extraído de Supabase) DENTRO del contenedor `app` ya desplegado.
 * Solo usa módulos que ya trae la imagen (pg) y node: no necesita tsx, ni el perfil `migracion`
 * del compose, ni conocer cómo Coolify arma el compose.
 *
 * En el servidor de Coolify:
 *   docker cp backup  <contenedor-app>:/tmp/backup
 *   docker cp importar-en-contenedor.cjs <contenedor-app>:/tmp/importar.cjs
 *   docker exec -u root -e NODE_PATH=/app/node_modules <contenedor-app> node /tmp/importar.cjs /tmp/backup [--reset]
 *
 * Se ejecuta como root dentro del contenedor (para leer el backup, que `docker cp` deja con los
 * permisos del origen) y deja los archivos copiados con el dueño del volumen de la app.
 *
 * Usa las variables del propio contenedor: DATABASE_URL, STORAGE_DIR, STORAGE_PUBLIC_URL.
 * Se niega a pisar una base que ya tiene usuarios salvo que se pase --reset.
 */
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const { Pool } = require('pg')

const dir = process.argv[2] || '/tmp/backup'
const reset = process.argv.includes('--reset')
const { DATABASE_URL, STORAGE_DIR, STORAGE_PUBLIC_URL } = process.env
if (!DATABASE_URL || !STORAGE_DIR || !STORAGE_PUBLIC_URL) {
  console.error('Faltan DATABASE_URL, STORAGE_DIR o STORAGE_PUBLIC_URL en el entorno del contenedor.')
  process.exit(2)
}
const SUPA = /https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/media\//g
const base = STORAGE_PUBLIC_URL.replace(/\/$/, '')
const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
const readRewritten = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8').replace(SUPA, `${base}/`))
const stable = (v) => JSON.stringify(v, (_k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b))) : x))

const TABLAS = ['site_settings', 'contact_leads', 'clientes', 'montajes', 'servicios', 'trabajos', 'galeria', 'gruas', 'empresas_agenda', 'operarios', 'eventos_agenda', 'eventos_operarios', 'tv_pairing_codes']

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL, max: 2 })
  const c = await pool.connect()
  try {
    const { rows } = await c.query('select count(*)::int n from "user"')
    if (rows[0].n > 0 && !reset) {
      console.error(`La base ya tiene ${rows[0].n} usuario(s). Para reemplazarlos: agregá --reset (borra TODO el contenido de la base).`)
      process.exit(3)
    }
    await c.query('begin')
    if (reset) {
      await c.query(`truncate tv_pairing_codes, push_tokens, notificaciones_enviadas, eventos_operarios, eventos_agenda,
        trabajos, clientes, montajes, servicios, galeria, gruas, empresas_agenda, operarios, contact_leads,
        site_settings, session, account, verification, "user" restart identity cascade`)
    }
    const users = read('auth_users.json')
    for (const u of users) {
      const meta = u.raw_user_meta_data || {}
      const name = meta.name || meta.full_name || u.email.split('@')[0]
      await c.query(
        `insert into "user" (id, name, email, email_verified, must_change_password, last_sign_in_at, created_at, updated_at)
         values ($1,$2,$3,$4,$5,$6,$7,$7)`,
        [u.id, name, u.email.toLowerCase(), !!u.email_confirmed_at, meta.must_change_password === true, u.last_sign_in_at, u.created_at],
      )
      await c.query(
        `insert into account (id, account_id, provider_id, user_id, password, created_at, updated_at)
         values ($1,$2,'credential',$2,$3,$4,$4)`,
        [`cred_${u.id}`, u.id, u.encrypted_password, u.created_at],
      )
    }
    console.log(`usuarios cargados: ${users.length}`)
    for (const t of TABLAS) {
      const rows2 = readRewritten(path.join('tablas', `${t}.json`))
      if (rows2.length) await c.query(`insert into "${t}" select * from jsonb_populate_recordset(null::"${t}", $1::jsonb)`, [JSON.stringify(rows2)])
      console.log(`  ${t}: ${rows2.length}`)
    }
    await c.query('commit')
  } catch (e) {
    await c.query('rollback').catch(() => {})
    throw e
  } finally {
    c.release()
  }

  // Archivos al volumen de la app
  const objetos = read('storage_objetos.json')
  for (const o of objetos) {
    const dest = path.join(STORAGE_DIR, o.name)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(path.join(dir, 'storage', o.name), dest)
  }
  // Como root, los archivos nuevos quedarían de root: la app (uid 10001) no podría reemplazarlos ni borrarlos.
  if (process.getuid && process.getuid() === 0) {
    const { uid, gid } = fs.statSync(STORAGE_DIR)
    const chownTree = (p) => {
      fs.chownSync(p, uid, gid)
      if (fs.statSync(p).isDirectory()) for (const f of fs.readdirSync(p)) chownTree(path.join(p, f))
    }
    chownTree(STORAGE_DIR)
  }
  console.log(`archivos copiados: ${objetos.length}`)

  // Verificación contra el backup
  let fallas = 0
  const falla = (m) => { fallas++; console.log('  FALLA ' + m) }
  for (const t of TABLAS) {
    const esperado = readRewritten(path.join('tablas', `${t}.json`))
    const { rows } = await pool.query(`select to_jsonb(t) as r from "${t}" t`)
    const key = (r) => String(r.id ?? r.key ?? `${r.evento_id}:${r.operario_id}`)
    const a = new Map(rows.map((x) => [key(x.r), stable(x.r)]))
    const e = new Map(esperado.map((r) => [key(r), stable(r)]))
    const malas = [...e.keys()].filter((k) => a.get(k) !== e.get(k)).length
    if (a.size !== e.size || malas) falla(`${t}: esperado ${e.size}, actual ${a.size}, distintas ${malas}`)
  }
  for (const u of read('auth_users.json')) {
    const { rows } = await pool.query(`select a.password from "user" x join account a on a.user_id=x.id and a.provider_id='credential' where x.id=$1 and x.email=$2`, [u.id, u.email.toLowerCase()])
    if (rows[0]?.password !== u.encrypted_password) falla(`usuario ${u.email.split('@')[0].slice(0, 3)}***`)
  }
  for (const m of read('storage_manifiesto.json')) {
    const sha = crypto.createHash('sha256').update(fs.readFileSync(path.join(STORAGE_DIR, m.name))).digest('hex')
    if (sha !== m.sha256) falla(`archivo ${m.name}`)
  }
  await pool.end()
  console.log(fallas === 0 ? '\nPARIDAD COMPLETA: la base y los archivos son idénticos al backup de producción.' : `\n${fallas} diferencia(s).`)
  process.exit(fallas === 0 ? 0 : 1)
}
main().catch((e) => { console.error(e.message || e); process.exit(1) })
