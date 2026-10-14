#!/usr/bin/env node
/**
 * Compara dos instancias del sitio público (producción vieja en Vercel vs. el entorno nuevo):
 * mismas rutas, mismo texto visible, mismos metadatos, y las MISMAS imágenes (bytes).
 *
 *   node scripts/migracion/comparar-sitios.mjs <URL-referencia> <URL-nueva>
 *   node scripts/migracion/comparar-sitios.mjs https://inglobal-site-theta.vercel.app https://inglobal-test.51.91.253.54.sslip.io
 *
 * Normaliza lo que DEBE diferir: el dominio del sitio y la URL base de los archivos
 * (Supabase Storage vs /media). Sale con código 1 si algo no coincide.
 */
import crypto from 'node:crypto'

const [refArg, newArg] = process.argv.slice(2)
if (!refArg || !newArg) {
  console.error('Uso: comparar-sitios.mjs <URL-referencia> <URL-nueva>')
  process.exit(2)
}
const REF = refArg.replace(/\/$/, '')
const NEW = newArg.replace(/\/$/, '')

const SUPA = /https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/media\//g
const hostRe = (u) => new RegExp(u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')

async function get(url) {
  const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'comparar-sitios/1.0' } })
  return { status: res.status, type: res.headers.get('content-type') ?? '', body: Buffer.from(await res.arrayBuffer()) }
}

/** Reemplaza dominios del sitio y la base de archivos por marcadores comparables. */
function normalize(s, origin) {
  return s
    .replace(SUPA, '{MEDIA}/')
    .replace(hostRe(origin + '/media/'), '{MEDIA}/')
    .replace(hostRe(origin), '{SITE}')
    // Vercel usa un host distinto por deployment (inglobal-site-<hash>-....vercel.app) para canonical/OG.
    .replace(/https:\/\/inglobal-site-[a-z0-9-]+\.vercel\.app/g, '{SITE}')
    // Dominio canónico por defecto (cuando NEXT_PUBLIC_SITE_URL no está definida).
    .replace(/https:\/\/gruasinglobal\.com/g, '{SITE}')
}

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim()
}

function meta(html) {
  const pick = (re) => (html.match(re)?.[1] ?? '').trim()
  return {
    title: pick(/<title[^>]*>([^<]*)<\/title>/i),
    description: pick(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i),
    ogTitle: pick(/<meta[^>]+property="og:title"[^>]+content="([^"]*)"/i),
    ogImage: pick(/<meta[^>]+property="og:image"[^>]+content="([^"]*)"/i),
    h1: [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => visibleText(m[1])).join(' | '),
  }
}

/** Imágenes y videos originales (decodifica el optimizador de Next: /_next/image?url=...). */
function mediaUrls(html, origin) {
  const found = new Set()
  const add = (u) => {
    if (!u) return
    let x = u.replace(/&amp;/g, '&')
    const opt = x.match(/_next\/image\?url=([^&]+)/)
    if (opt) x = decodeURIComponent(opt[1])
    if (x.startsWith('/')) x = origin + x
    if (/^https?:\/\//.test(x)) found.add(x)
  }
  for (const m of html.matchAll(/(?:src|poster|href)="([^"]+\.(?:jpe?g|png|webp|avif|gif|mp4|webm|pdf)[^"]*)"/gi)) add(m[1])
  for (const m of html.matchAll(/(?:srcset|imagesrcset)="([^"]+)"/gi)) for (const part of m[1].split(',')) add(part.trim().split(' ')[0])
  for (const m of html.matchAll(/content="(https?:[^"]+\.(?:jpe?g|png|webp|avif))"/gi)) add(m[1])
  for (const m of html.matchAll(/[a-z0-9]{8,}\.supabase\.co\/storage\/v1\/object\/public\/media\/[^"'\s)&\\]+/gi)) add('https://' + m[0])
  // Solo archivos del bucket (propios), no recursos estáticos del build.
  return [...found].filter((u) => SUPA.test(u.replace(SUPA, '{M}')) || u.includes('/media/') || /supabase\.co/.test(u))
    .map((u) => u.replace(/\?.*$/, ''))
}

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex')
let diffs = 0
const out = (ok, msg) => { if (!ok) diffs++; console.log(`  ${ok ? 'ok   ' : 'DIFF '} ${msg}`) }

async function main() {
  console.log(`Referencia: ${REF}\nNueva:      ${NEW}\n`)
  // Rutas: las del sitemap de la referencia (+ fijas)
  const sm = await get(REF + '/sitemap.xml')
  const locs = [...sm.body.toString().matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
  const paths = [...new Set(['/', '/aviso-legal', '/politica-de-privacidad', ...locs])].filter((p) => !p.startsWith('/agenda-tv'))
  console.log(`Rutas a comparar: ${paths.length}\n`)

  const refMedia = new Map()
  const newMedia = new Map()
  for (const p of paths) {
    const [a, b] = await Promise.all([get(REF + p), get(NEW + p)])
    if (a.status !== b.status) { out(false, `${p}: status ${a.status} vs ${b.status}`); continue }
    const ha = normalize(a.body.toString(), REF)
    const hb = normalize(b.body.toString(), NEW)
    const ta = visibleText(ha), tb = visibleText(hb)
    const ma = meta(ha), mb = meta(hb)
    const problems = []
    if (ta !== tb) {
      let i = 0
      while (i < ta.length && ta[i] === tb[i]) i++
      problems.push(`texto distinto en pos ${i}: ref="${ta.slice(Math.max(0, i - 20), i + 50)}" nueva="${tb.slice(Math.max(0, i - 20), i + 50)}"`)
    }
    for (const k of Object.keys(ma)) if (ma[k] !== mb[k]) problems.push(`${k}: ref="${ma[k].slice(0, 70)}" nueva="${mb[k].slice(0, 70)}"`)
    const ua = new Set(mediaUrls(ha, '{SITE}').map((u) => u.replace(/^.*?(?=\{MEDIA\}|\/media\/|supabase)/, '')))
    const ub = new Set(mediaUrls(hb, '{SITE}').map((u) => u.replace(/^.*?(?=\{MEDIA\}|\/media\/|supabase)/, '')))
    // los archivos se comparan por ruta relativa dentro del bucket
    const rel = (u) => u.replace(/^.*\/media\//, '').replace(/^\{MEDIA\}\//, '')
    for (const u of mediaUrls(a.body.toString(), REF)) refMedia.set(rel(u), u)
    for (const u of mediaUrls(b.body.toString(), NEW)) newMedia.set(rel(u), u)
    out(problems.length === 0, `${p}${problems.length ? '\n        ' + problems.join('\n        ') : ''}`)
    void ua; void ub
  }

  console.log(`\nArchivos referenciados: ${refMedia.size} (referencia) vs ${newMedia.size} (nueva)`)
  const soloRef = [...refMedia.keys()].filter((k) => !newMedia.has(k))
  const soloNew = [...newMedia.keys()].filter((k) => !refMedia.has(k))
  out(soloRef.length === 0 && soloNew.length === 0, `mismos archivos${soloRef.length ? ` | faltan en nueva: ${soloRef.slice(0, 5).join(', ')}` : ''}${soloNew.length ? ` | de más en nueva: ${soloNew.slice(0, 5).join(', ')}` : ''}`)

  let same = 0
  let checked = 0
  for (const [k, urlRef] of refMedia) {
    if (!newMedia.has(k)) continue
    checked++
    const [a, b] = await Promise.all([get(urlRef), get(newMedia.get(k))])
    if (a.status === 200 && b.status === 200 && sha(a.body) === sha(b.body)) same++
    else out(false, `archivo ${k}: ref HTTP ${a.status} ${a.body.length}b, nueva HTTP ${b.status} ${b.body.length}b`)
  }
  out(same === checked, `${same}/${checked} archivos idénticos byte a byte`)

  console.log(diffs === 0 ? '\nSITIOS IDÉNTICOS' : `\n${diffs} diferencia(s)`)
  process.exit(diffs === 0 ? 0 : 1)
}
main().catch((e) => { console.error(e); process.exit(1) })
