#!/usr/bin/env node
/**
 * Seed de prueba para `trabajos` (única tabla de contenido sin datos reales
 * todavía — montajes/clientes/servicios ya vienen seedeados por sus
 * migraciones). Corre contra el Supabase apuntado por .env.local (dev).
 *
 * Idempotente: borra los trabajos de los clientes de prueba antes de
 * insertar, así se puede correr de nuevo sin duplicar.
 *
 * Run con: node scripts/seed-trabajos.mjs
 */

import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function loadEnv(file) {
  const p = path.resolve(process.cwd(), file)
  if (!existsSync(p)) return {}
  const out = {}
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return out
}

const env = { ...loadEnv('.env.local'), ...loadEnv('.env.development.local') }
const url = env.NEXT_PUBLIC_SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}

const supabase = createClient(url, key)

const CLIENTE_SLUGS = ['coca-cola', 'epec', 'aguas-cordobesas']

const PARRAFOS = [
  '<p>El desafío consistió en coordinar el traslado e izaje de equipamiento de gran porte dentro de un predio operativo, sin interrumpir la producción del cliente durante la maniobra.</p>',
  '<h2>Planificación</h2><p>Se realizó un relevamiento previo del terreno y un plan de izaje firmado por ingeniero matriculado, contemplando radios de giro, capacidad de suelo y distancias de seguridad.</p>',
  '<blockquote>La precisión en cada maniobra es lo que nos permite operar en plantas activas sin generar tiempos muertos para el cliente.</blockquote>',
  '<h2>Ejecución</h2><p>El operativo se completó en una sola jornada, con equipos certificados y personal capacitado en trabajo en altura y espacios confinados.</p>',
]

function contentFor(i) {
  return PARRAFOS.slice(0, 2 + (i % 3)).join('')
}

async function main() {
  const { data: clientes, error: cErr } = await supabase
    .from('clientes')
    .select('id, slug')
    .in('slug', CLIENTE_SLUGS)

  if (cErr) throw cErr
  if (!clientes?.length) {
    console.error('No se encontraron clientes con esos slugs. ¿Corriste db-sync-dev.mjs?')
    process.exit(1)
  }

  for (const cliente of clientes) {
    const { error: delErr } = await supabase.from('trabajos').delete().eq('cliente_id', cliente.id)
    if (delErr) throw delErr

    // 7 trabajos en 'coca-cola' para poder ver la paginación (PER_PAGE=6), 3 en el resto.
    const count = cliente.slug === 'coca-cola' ? 7 : 3
    const rows = Array.from({ length: count }, (_, i) => ({
      cliente_id: cliente.id,
      slug: `trabajo-prueba-${i + 1}`,
      title: `Trabajo de prueba #${i + 1} — ${cliente.slug}`,
      excerpt: 'Izaje y montaje de equipamiento industrial coordinado con el equipo técnico del cliente.',
      content: contentFor(i),
      cover_image: `/images/igb-${(i % 10) + 1}.webp`,
      youtube_url: null,
      display_order: i,
      published: true,
    }))

    const { error: insErr } = await supabase.from('trabajos').insert(rows)
    if (insErr) throw insErr
    console.log(`  ok  ${cliente.slug.padEnd(20, ' ')} ${count} trabajos`)
  }

  console.log('\nSeed de trabajos completo.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
