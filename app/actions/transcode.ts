'use server'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createTranscodeToken } from '@/lib/transcode-token'

// Emite un token de corta duración para que el navegador suba video directo
// al servicio de transcode del VPS (services/video-transcode), sin pasar por
// el body limit de 4.5MB de las funciones serverless de Vercel. Si el
// servicio no está configurado (NEXT_PUBLIC_TRANSCODE_SERVICE_URL vacío) o el
// usuario no está logueado, devuelve null — el caller cae al upload directo
// sin comprimir (lib/client-upload.ts), nunca bloquea la subida.
export async function getTranscodeUploadInfo(): Promise<{ url: string; token: string } | null> {
  const serviceUrl = process.env.NEXT_PUBLIC_TRANSCODE_SERVICE_URL
  if (!serviceUrl) return null

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  try {
    return { url: serviceUrl, token: createTranscodeToken() }
  } catch {
    return null
  }
}
