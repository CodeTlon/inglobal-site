/**
 * lib/storage.ts — archivos subidos (fotos, videos, PDFs). Reemplaza a Supabase Storage.
 *
 * Dos drivers, el mismo contrato:
 *  - **Disco** (`STORAGE_DIR`, el del docker-compose de Coolify): los archivos viven en un
 *    volumen de Docker y los sirve la propia app en `/media/...` (app/media/[...ruta]). Sin
 *    servicios extra, como en gc2-entrenamiento.
 *  - **S3-compatible** (`S3_ENDPOINT`: MinIO o Cloudflare R2): para cuando haga falta un
 *    bucket externo o más de una réplica.
 *
 * Las URLs que se guardan en la base son públicas: `${STORAGE_PUBLIC_URL}/<carpeta>/<uuid>.<ext>`.
 * La lectura es pública (bucket con policy de GetObject); escribir y borrar solo
 * pasa por el servidor, con credenciales.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  PutBucketPolicyCommand,
} from '@aws-sdk/client-s3'

const STORAGE_DIR = () => process.env.STORAGE_DIR?.trim() || null
const BUCKET = () => process.env.S3_BUCKET ?? 'media'
const PUBLIC_BASE = () => (process.env.STORAGE_PUBLIC_URL ?? '').replace(/\/$/, '')

let client: S3Client | null = null
function s3(): S3Client {
  if (!client) {
    client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION ?? 'us-east-1',
      forcePathStyle: true, // MinIO y R2 lo requieren
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID ?? 'placeholder',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? 'placeholder',
      },
    })
  }
  return client
}

/** URL pública de un objeto del bucket. */
export function mediaPublicUrl(path: string): string {
  return `${PUBLIC_BASE()}/${path}`
}

/**
 * Extrae el path dentro del bucket de una URL pública. Acepta la base actual y
 * también el formato histórico de Supabase (`.../storage/v1/object/public/media/`)
 * por si quedara alguna URL sin migrar.
 */
export function extractStoragePath(url: string): string | null {
  const clean = url.split('#')[0].split('?')[0]
  const base = PUBLIC_BASE()
  if (base && clean.startsWith(`${base}/`)) return clean.slice(base.length + 1)
  const legacy = clean.match(/\/storage\/v1\/object\/public\/media\/(.+)/)
  return legacy?.[1] ?? null
}

/**
 * Ruta absoluta dentro de STORAGE_DIR, o `null` si intenta salirse (`..`, absolutas).
 * Única puerta de entrada al disco: la usan la subida, el borrado y la ruta /media.
 */
export function resolveStoragePath(relPath: string): string | null {
  const root = STORAGE_DIR()
  if (!root) return null
  const base = path.resolve(root)
  const full = path.resolve(base, relPath)
  return full.startsWith(base + path.sep) ? full : null
}

export async function putMedia(relPath: string, body: Buffer, contentType: string): Promise<string> {
  if (STORAGE_DIR()) {
    const full = resolveStoragePath(relPath)
    if (!full) throw new Error('Ruta de archivo inválida.')
    await fs.mkdir(path.dirname(full), { recursive: true })
    // Escritura atómica: nunca se sirve un archivo a medio escribir.
    const tmp = `${full}.${process.pid}.tmp`
    await fs.writeFile(tmp, body)
    await fs.rename(tmp, full)
    return mediaPublicUrl(relPath)
  }
  await s3().send(
    new PutObjectCommand({ Bucket: BUCKET(), Key: relPath, Body: body, ContentType: contentType, CacheControl: 'public, max-age=3600' }),
  )
  return mediaPublicUrl(relPath)
}

export async function removeMedia(paths: string[]): Promise<void> {
  if (paths.length === 0) return
  if (STORAGE_DIR()) {
    await Promise.all(
      paths.map(async (p) => {
        const full = resolveStoragePath(p)
        if (full) await fs.unlink(full).catch(() => {})
      }),
    )
    return
  }
  await s3().send(
    new DeleteObjectsCommand({ Bucket: BUCKET(), Delete: { Objects: paths.map((Key) => ({ Key })), Quiet: true } }),
  )
}

/** Borra del bucket los archivos referenciados por las URLs dadas (ignora vacíos/externas). */
export async function removeMediaUrls(urls: (string | null | undefined)[]): Promise<void> {
  const paths = urls
    .filter((u): u is string => Boolean(u))
    .map(extractStoragePath)
    .filter((p): p is string => Boolean(p))
  await removeMedia(paths)
}

/**
 * Deja el almacenamiento listo al arrancar: crea el directorio (disco) o el bucket con lectura
 * pública de objetos (S3). Idempotente; el compose no necesita un contenedor de inicialización.
 */
export async function ensureBucket(): Promise<void> {
  const dir = STORAGE_DIR()
  if (dir) {
    await fs.mkdir(dir, { recursive: true })
    return
  }
  const Bucket = BUCKET()
  try {
    await s3().send(new HeadBucketCommand({ Bucket }))
  } catch {
    await s3().send(new CreateBucketCommand({ Bucket }))
  }
  await s3().send(
    new PutBucketPolicyCommand({
      Bucket,
      Policy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [{ Effect: 'Allow', Principal: '*', Action: ['s3:GetObject'], Resource: [`arn:aws:s3:::${Bucket}/*`] }],
      }),
    }),
  )
}
