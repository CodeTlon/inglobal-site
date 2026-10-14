/**
 * lib/storage.ts — archivos (bucket `media`) en almacenamiento S3-compatible
 * (MinIO en Coolify, o R2). Reemplaza a Supabase Storage.
 *
 * Las URLs que se guardan en la base son públicas: `${STORAGE_PUBLIC_URL}/<carpeta>/<uuid>.<ext>`.
 * La lectura es pública (bucket con policy de GetObject); escribir y borrar solo
 * pasa por el servidor, con credenciales.
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  PutBucketPolicyCommand,
} from '@aws-sdk/client-s3'

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

export async function putMedia(path: string, body: Buffer, contentType: string): Promise<string> {
  await s3().send(
    new PutObjectCommand({ Bucket: BUCKET(), Key: path, Body: body, ContentType: contentType, CacheControl: 'public, max-age=3600' }),
  )
  return mediaPublicUrl(path)
}

export async function removeMedia(paths: string[]): Promise<void> {
  if (paths.length === 0) return
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
 * Deja el bucket listo al arrancar: lo crea si no existe y le pone lectura pública de
 * objetos (escribir/borrar sigue exigiendo credenciales). Idempotente. Así el
 * docker-compose no necesita un contenedor extra para inicializar MinIO.
 */
export async function ensureBucket(): Promise<void> {
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
