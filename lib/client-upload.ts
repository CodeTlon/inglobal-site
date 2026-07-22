import { createSupabaseBrowserClient } from '@/lib/supabase'
import { friendlyError } from '@/lib/friendly-error'

/**
 * Sube un archivo directo al bucket `media` desde el navegador (bypass del
 * Server Action) — usado para video/PDF, que Vercel rechaza con un 413 crudo
 * si pasan de 4.5MB por la función serverless (ver lib/supabase.ts). El
 * bucket ya tiene RLS que permite INSERT/DELETE a cualquier `authenticated`
 * (supabase/migrations/006_storage_media.sql), que es lo que es cualquier
 * usuario logueado en el panel.
 */
export async function uploadDirectToStorage(
  file: File,
  folder: string,
): Promise<{ url?: string; error?: string }> {
  const supabase = createSupabaseBrowserClient()
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const path = `${folder}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from('media')
    .upload(path, file, { contentType: file.type || undefined, upsert: false })
  if (error) return { error: friendlyError(error, 'No se pudo subir el archivo. Intentá de nuevo.') }

  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return { url: data.publicUrl }
}
