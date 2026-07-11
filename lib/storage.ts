import type { SupabaseClient } from '@supabase/supabase-js'

/** Extrae el path dentro del bucket `media` de una URL pública de Supabase Storage. */
export function extractStoragePath(url: string): string | null {
  const match = url.split('#')[0].match(/\/storage\/v1\/object\/public\/media\/(.+)/)
  return match?.[1] ?? null
}

/** Borra del bucket `media` los archivos referenciados por las URLs dadas (ignora vacíos/externas). */
export async function removeMediaUrls(
  supabase: SupabaseClient,
  urls: (string | null | undefined)[],
): Promise<void> {
  const paths = urls
    .filter((u): u is string => Boolean(u))
    .map(extractStoragePath)
    .filter((p): p is string => Boolean(p))
  if (paths.length === 0) return
  await supabase.storage.from('media').remove(paths)
}
