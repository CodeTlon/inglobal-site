#!/usr/bin/env node
/**
 * Genera los íconos de la PWA (Agenda instalable) a partir del logo.
 * Compone el logo sobre un fondo cuadrado color marca (opaco, sin alpha —
 * iOS necesita apple-touch-icon sin transparencia). Correr a mano cuando
 * cambie el logo: node scripts/generate-pwa-icons.mjs
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = process.cwd()
const LOGO = path.join(ROOT, 'public', 'images', 'logo.png')
const OUT_DIR = path.join(ROOT, 'public', 'icons')
const BG = '#f5d100'

// Recorte del isotipo (el globo+gancho circular) del logo completo —
// el wordmark entero ilegible a tamaño de ícono de celular.
const MARK_CROP = { left: 8, top: 0, width: 225, height: 165 }

async function makeIcon(size, { safeZonePct = 0.18 } = {}) {
  const logoWidth = Math.round(size * (1 - safeZonePct * 2))
  const logo = await sharp(LOGO).extract(MARK_CROP).resize({ width: logoWidth, fit: 'inside' }).toBuffer()
  const { width, height } = await sharp(logo).metadata()

  return sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: logo, left: Math.round((size - width) / 2), top: Math.round((size - height) / 2) }])
    .flatten({ background: BG })
    .png()
    .toBuffer()
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true })

  const targets = [
    { name: 'icon-192.png', size: 192, safeZonePct: 0.18 },
    { name: 'icon-512.png', size: 512, safeZonePct: 0.18 },
    { name: 'icon-512-maskable.png', size: 512, safeZonePct: 0.3 },
    { name: 'apple-touch-icon.png', size: 180, safeZonePct: 0.18 },
  ]

  for (const t of targets) {
    const buf = await makeIcon(t.size, { safeZonePct: t.safeZonePct })
    await fs.writeFile(path.join(OUT_DIR, t.name), buf)
    console.log(`  ok  ${t.name} (${t.size}x${t.size})`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
