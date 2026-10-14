/**
 * Envío de push vía Expo Push Service (https://docs.expo.dev/push-notifications/sending-notifications/).
 * Solo para uso server-side con el cliente admin (push_tokens no tiene policies).
 */

import type { SupabaseClient } from '@supabase/supabase-js'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'
const LOTE = 100

export type MensajePush = {
  to: string
  title: string
  body: string
  data?: Record<string, string>
}

type TicketExpo = { status: 'ok' | 'error'; details?: { error?: string } }

/**
 * Envía en lotes de 100 y devuelve los tokens que Expo reportó como
 * `DeviceNotRegistered` (app desinstalada) para que el llamador los borre.
 * Un lote que falla no aborta los demás.
 */
export async function enviarPush(mensajes: MensajePush[]): Promise<{ enviados: number; tokensInvalidos: string[] }> {
  let enviados = 0
  const tokensInvalidos: string[] = []

  for (let i = 0; i < mensajes.length; i += LOTE) {
    const lote = mensajes.slice(i, i + LOTE)
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(lote.map((m) => ({ ...m, sound: 'default', channelId: 'agenda' }))),
      })
      if (!res.ok) continue
      const json = (await res.json()) as { data?: TicketExpo[] }
      json.data?.forEach((ticket, idx) => {
        if (ticket.status === 'ok') enviados++
        else if (ticket.details?.error === 'DeviceNotRegistered') tokensInvalidos.push(lote[idx].to)
      })
    } catch {
      // Best-effort: el siguiente corrido del cron no reintenta (idempotencia por clave),
      // pero un aviso perdido es preferible a un duplicado.
    }
  }

  return { enviados, tokensInvalidos }
}

/** Todos los tokens registrados (destinatarios = todos los dispositivos logueados). */
export async function getTokensPush(admin: SupabaseClient): Promise<string[]> {
  const { data } = await admin.from('push_tokens').select('token')
  return (data ?? []).map((r) => r.token as string)
}

export async function borrarTokens(admin: SupabaseClient, tokens: string[]): Promise<void> {
  if (tokens.length === 0) return
  await admin.from('push_tokens').delete().in('token', tokens)
}

/**
 * Reclama una clave de idempotencia. `true` si este corrido es el primero en
 * enviar ese aviso; `false` si ya se había enviado (violación de PK).
 */
export async function reclamarClave(admin: SupabaseClient, clave: string): Promise<boolean> {
  const { error } = await admin.from('notificaciones_enviadas').insert({ clave })
  return !error
}
