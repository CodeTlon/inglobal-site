import { db } from '@/lib/db'
import { requireApiUser, apiData, apiError } from '@/lib/api-auth'
import { friendlyError } from '@/lib/friendly-error'

// Formato del Expo push token: ExponentPushToken[xxxx] o ExpoPushToken[xxxx].
const TOKEN_RE = /^Expo(nent)?PushToken\[[A-Za-z0-9_-]{10,}\]$/

export async function POST(request: Request) {
  try {
    const auth = await requireApiUser(request)
    if (auth instanceof Response) return auth

    const body = await request.json().catch(() => null)
    const token = typeof body?.token === 'string' ? body.token : ''
    const plataforma = body?.plataforma === 'ios' || body?.plataforma === 'android' ? body.plataforma : null
    if (!TOKEN_RE.test(token)) return apiError('Token inválido.', 400)

    // push_tokens no tiene policies: se escribe con service_role, tras validar el JWT arriba.
    const admin = db
    const { error } = await admin
      .from('push_tokens')
      .upsert(
        { token, user_id: auth.user.id, plataforma, last_seen_at: new Date().toISOString() },
        { onConflict: 'token' },
      )
    if (error) return apiError(friendlyError(error), 500)

    return apiData({ ok: true })
  } catch (e) {
    return apiError(friendlyError(e), 500)
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireApiUser(request)
    if (auth instanceof Response) return auth

    const body = await request.json().catch(() => null)
    const token = typeof body?.token === 'string' ? body.token : ''
    if (!TOKEN_RE.test(token)) return apiError('Token inválido.', 400)

    // Solo borra el token si pertenece a quien lo pide.
    const admin = db
    const { error } = await admin.from('push_tokens').delete().eq('token', token).eq('user_id', auth.user.id)
    if (error) return apiError(friendlyError(error), 500)

    return apiData({ ok: true })
  } catch (e) {
    return apiError(friendlyError(e), 500)
  }
}
