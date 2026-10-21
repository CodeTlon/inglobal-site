/**
 * Varias grúas por servicio (migración 0004, eventos_gruas).
 * Las reglas puras corren siempre; las que tocan la base se saltean sin DATABASE_URL local con las
 * migraciones aplicadas (usan datos propios con prefijo ZZ-PRUEBA-GRUAS y los borran al terminar).
 *   DATABASE_URL=postgres://inglobal:inglobal@127.0.0.1:41510/inglobal npx tsx --test tests/unit/gruas-evento.test.ts
 */
import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { db } from '../../lib/db'
import {
  buscarConflicto,
  getRecursosOcupados,
  resolverGruaIds,
  resolverGruaIdsEdicion,
  syncEventoGruas,
  validarGruas,
} from '../../lib/agenda-business'
import { crearEventoSchema, eventoAgendaSchema, MAX_GRUAS_EVENTO } from '../../lib/validations/agenda'

const U1 = '11111111-1111-4111-8111-111111111111'
const U2 = '22222222-2222-4222-8222-222222222222'

test('resolverGruaIds: sin grua_ids usa grua_id; con grua_ids quita repetidas y respeta el orden', () => {
  assert.deepEqual(resolverGruaIds(undefined, U1), [U1])
  assert.deepEqual(resolverGruaIds([], U1), [U1])
  assert.deepEqual(resolverGruaIds([U2, U1, U2], U1), [U2, U1])
})

test('schema: grua_ids opcional, mínimo 1 y máximo MAX_GRUAS_EVENTO', () => {
  const base = { fecha: '2099-01-01', hora_inicio: '08:00', hora_fin: '10:00', grua_id: U1, empresa_id: U2, estado: 'programado' }
  assert.ok(eventoAgendaSchema.safeParse(base).success, 'cliente viejo (solo grua_id) sigue válido')
  assert.ok(eventoAgendaSchema.safeParse({ ...base, grua_ids: [U1, U2] }).success)
  assert.ok(!eventoAgendaSchema.safeParse({ ...base, grua_ids: [] }).success)
  const muchas = Array.from({ length: MAX_GRUAS_EVENTO + 1 }, (_, i) => `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`)
  assert.ok(!crearEventoSchema.safeParse({ ...base, grua_ids: muchas }).success)
})

const hayDb = Boolean(process.env.DATABASE_URL)
const omitir = !hayDb && 'requiere DATABASE_URL (base local migrada)'

async function insertar(tabla: string, fila: Record<string, unknown>) {
  const { data, error } = await db.from(tabla).insert(fila).select('id').single()
  assert.equal(error, null, JSON.stringify(error))
  return data!.id as string
}

test('gruas por evento: conflicto en cualquiera de las grúas, compat. cliente viejo y ocupados', { skip: omitir }, async () => {
  const mes = '2099-06'
  const g1 = await insertar('gruas', { nombre: 'ZZ-PRUEBA-GRUAS 1', tipo: 'Grúa', activo: true })
  const g2 = await insertar('gruas', { nombre: 'ZZ-PRUEBA-GRUAS 2', tipo: 'Grúa', activo: true })
  const g3 = await insertar('gruas', { nombre: 'ZZ-PRUEBA-GRUAS 3 inactiva', tipo: 'Grúa', activo: false })
  const emp = await insertar('empresas_agenda', { nombre: 'ZZ-PRUEBA-GRUAS EMPRESA', tipo: 'particular', activo: true })
  const eventos: string[] = []
  try {
    // Servicio A: g1 + g2, 08:00-12:00
    const a = await insertar('eventos_agenda', { fecha: `${mes}-10`, hora_inicio: '08:00', hora_fin: '12:00', grua_id: g1, empresa_id: emp, estado: 'programado' })
    eventos.push(a)
    assert.equal(await syncEventoGruas(db, a, [g1, g2]), null)

    // listado: las dos grúas, la principal primero
    const { data: filas } = await db.from('eventos_gruas').select('grua_id, orden').eq('evento_id', a)
    assert.deepEqual([...(filas ?? [])].sort((x, y) => x.orden - y.orden).map((f) => f.grua_id), [g1, g2])

    // Conflicto: otro servicio que pide SOLO la grúa secundaria (g2) en un horario solapado
    const ventana = { fecha: `${mes}-10`, fecha_hasta: null, hora_inicio: '10:00', hora_fin: '14:00' }
    const c1 = await buscarConflicto(db, ventana, [g2], [])
    assert.match(c1 ?? '', /ZZ-PRUEBA-GRUAS 2 ya está asignada/)
    // Sin solapamiento -> libre
    assert.equal(await buscarConflicto(db, { ...ventana, hora_inicio: '13:00', hora_fin: '15:00' }, [g1, g2], []), null)
    // Editar el propio servicio no choca consigo mismo
    assert.equal(await buscarConflicto(db, ventana, [g1, g2], [], a), null)

    // Ocupados: ambas grúas del servicio A figuran ocupadas en esa ventana
    const oc = await getRecursosOcupados(db, ventana.fecha, null, ventana.hora_inicio, ventana.hora_fin)
    assert.ok(oc.gruaIds.includes(g1) && oc.gruaIds.includes(g2))

    // El trigger de la base también lo frena (carrera entre dos altas)
    const b = await insertar('eventos_agenda', { fecha: `${mes}-10`, hora_inicio: '09:00', hora_fin: '11:00', grua_id: null, empresa_id: emp, estado: 'programado' })
    eventos.push(b)
    const errSync = await syncEventoGruas(db, b, [g2])
    assert.ok(errSync, 'el trigger debería rechazar la grúa ocupada')

    // Compatibilidad PATCH: cliente viejo manda solo grua_id que YA es del evento -> la lista no se toca
    assert.deepEqual(await resolverGruaIdsEdicion(db, a, undefined, g1), [g1, g2])
    assert.deepEqual(await resolverGruaIdsEdicion(db, a, undefined, g2), [g1, g2])
    // ...y si cambió la grúa a propósito (una que no estaba) se reemplaza por esa
    assert.deepEqual(await resolverGruaIdsEdicion(db, a, undefined, g3), [g3])
    // Con grua_ids explícito manda la lista nueva
    assert.deepEqual(await resolverGruaIdsEdicion(db, a, [g2], g1), [g2])

    // Validación: una grúa inactiva rechaza el servicio entero
    assert.match((await validarGruas(db, [g1, g3])) ?? '', /inactiva/)
    assert.equal(await validarGruas(db, [g1, g2]), null)
  } finally {
    for (const id of eventos) await db.from('eventos_agenda').delete().eq('id', id)
    await db.from('empresas_agenda').delete().eq('id', emp)
    for (const id of [g1, g2, g3]) await db.from('gruas').delete().eq('id', id)
  }
})

// Cierra el pool de pg (lib/db.ts lo guarda en globalThis) para que el runner no quede colgado.
after(async () => {
  await (globalThis as unknown as { pgPool?: { end(): Promise<void> } }).pgPool?.end()
})
