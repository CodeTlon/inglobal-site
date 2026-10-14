/**
 * Paridad de la capa lib/db.ts contra el backup de producción (mismo to_jsonb que PostgREST).
 * Requiere la base local cargada con scripts/migracion/importar-prod.ts.
 *   DATABASE_URL=... BACKUP_DIR=... npx tsx --test tests/unit/db.test.ts
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { db, parseSelect } from '../../lib/db'

const dir = process.env.BACKUP_DIR!
const prod = (t: string) => JSON.parse(fs.readFileSync(path.join(dir, 'tablas', `${t}.json`), 'utf8')) as Record<string, unknown>[]
const norm = (v: unknown) => JSON.parse(JSON.stringify(v).replace(/https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/media\//g, '@@/').replace(/http:\/\/127\.0\.0\.1:41511\/media\//g, '@@/'))
const key = (r: Record<string, unknown>) => String(r.id ?? r.key)

for (const t of ['clientes', 'montajes', 'servicios', 'galeria', 'gruas', 'empresas_agenda', 'operarios', 'eventos_agenda', 'site_settings']) {
  test(`${t}: select('*') idéntico a prod`, async () => {
    const { data, error } = await db.from(t).select('*')
    assert.equal(error, null)
    const a = (norm(data) as Record<string, unknown>[]).sort((x, y) => key(x).localeCompare(key(y)))
    const b = (norm(prod(t)) as Record<string, unknown>[]).sort((x, y) => key(x).localeCompare(key(y)))
    assert.deepEqual(a, b)
  })
}

test('relaciones anidadas como PostgREST', async () => {
  const { data, error } = await db
    .from('eventos_agenda')
    .select('*, grua:gruas(nombre), empresa:empresas_agenda(nombre), eventos_operarios(operario:operarios(id, nombre, roles, eliminado_at))')
    .order('fecha', { ascending: true })
  assert.equal(error, null)
  assert.ok(data!.length > 0)
  const ev = data![0]
  assert.ok('grua' in ev && 'empresa' in ev && Array.isArray(ev.eventos_operarios))
  assert.ok(ev.eventos_operarios.every((eo: { operario: { id: string } }) => typeof eo.operario.id === 'string'))
})

test('single / maybeSingle / count / filtros', async () => {
  const { data: g } = await db.from('gruas').select('id').limit(1)
  const id = g![0].id
  assert.equal((await db.from('gruas').select('id').eq('id', id).single()).data.id, id)
  const miss = await db.from('gruas').select('id').eq('id', '00000000-0000-0000-0000-000000000000').single()
  assert.equal(miss.error?.code, 'PGRST116')
  assert.equal((await db.from('gruas').select('id').eq('id', '00000000-0000-0000-0000-000000000000').maybeSingle()).data, null)
  const c = await db.from('gruas').select('id', { count: 'exact', head: true })
  assert.equal(c.count, 9)
  const or = await db.from('eventos_agenda').select('id').or('fecha_hasta.gte.2000-01-01,and(fecha_hasta.is.null,fecha.gte.2000-01-01)')
  assert.equal(or.error, null)
  assert.equal((await db.from('operarios').select('id').is('eliminado_at', null).in('activo', [true, false])).error, null)
})

test('insert/update/upsert/delete con returning y errores de PG', async () => {
  const ins = await db.from('empresas_agenda').insert({ nombre: 'ZZ-TEST', tipo: 'particular' }).select('id, nombre, activo, created_at').single()
  assert.equal(ins.error, null)
  assert.equal(ins.data.activo, true) // default
  const upd = await db.from('empresas_agenda').update({ nombre: 'ZZ-TEST-2', activo: false }).eq('id', ins.data.id).select('nombre, activo').single()
  assert.deepEqual(upd.data, { nombre: 'ZZ-TEST-2', activo: false })
  const bad = await db.from('empresas_agenda').update({ tipo: 'inexistente' }).eq('id', ins.data.id)
  assert.equal(bad.error?.code, '23514') // CHECK
  await db.from('site_settings').upsert({ key: 'zz_test', value: { a: 1 } }, { onConflict: 'key' })
  await db.from('site_settings').upsert({ key: 'zz_test', value: { a: 2 } }, { onConflict: 'key' })
  assert.deepEqual((await db.from('site_settings').select('value').eq('key', 'zz_test').single()).data.value, { a: 2 })
  await db.from('site_settings').delete().eq('key', 'zz_test')
  const del = await db.from('empresas_agenda').delete().eq('id', ins.data.id).select('id')
  assert.equal(del.data!.length, 1)
})

test('parseSelect y rechazo de identificadores peligrosos', async () => {
  assert.deepEqual(parseSelect('id, a:gruas(nombre)').embeds[0], { alias: 'a', table: 'gruas', node: { columns: ['nombre'], embeds: [] } })
  const r = await db.from('gruas').select('id').eq('id; drop table gruas', 'x')
  assert.ok(r.error)
  assert.equal((await db.from('gruas').select('id', { count: 'exact', head: true })).count, 9)
})

test.after(async () => { await db.pool().end() })
