/**
 * Traduce errores crudos de Supabase/Postgres (códigos, mensajes en inglés)
 * a un texto en castellano apto para mostrar al usuario del dashboard.
 * Usar en TODO catch/`if (error)` de un server action antes de meterlo en `state.error`
 * — nunca exponer `error.message` de Supabase directo a la UI.
 */

const PG_CODE_MESSAGES: Record<string, string> = {
  '23505': 'Ya existe un registro con ese valor. Revisá que no esté duplicado.',
  '23503': 'No se puede completar la acción porque hay datos relacionados que dependen de esto.',
  '23502': 'Falta completar un campo obligatorio.',
  '22P02': 'Uno de los valores enviados no tiene el formato esperado.',
  '42501': 'No tenés permisos para realizar esta acción.',
  '23P01': 'La grúa o el operario ya están reservados en ese horario. Recargá y volvé a intentar.',
  'PGRST116': 'No se encontró el registro solicitado.',
  'PGRST301': 'Tu sesión expiró. Iniciá sesión de nuevo.',
}

const MESSAGE_PATTERNS: [RegExp, string][] = [
  [/JWT|session|not authenticated|refresh_token/i, 'Tu sesión expiró. Iniciá sesión de nuevo.'],
  [/already been registered|already registered/i, 'Ya existe un usuario con ese email.'],
  [/duplicate key|already exists/i, 'Ya existe un registro con ese valor.'],
  [/foreign key/i, 'No se puede completar la acción porque hay datos relacionados que dependen de esto.'],
  [/violates row-level security/i, 'No tenés permisos para realizar esta acción.'],
  [/network|fetch failed|ECONNRESET|ETIMEDOUT|timeout/i, 'No se pudo conectar. Revisá tu conexión e intentá de nuevo.'],
  [/payload too large|exceeded the maximum allowed size/i, 'El archivo es demasiado grande.'],
  [/password should be different/i, 'La nueva contraseña debe ser distinta de la anterior.'],
  [/password.{0,20}(at least|should be)/i, 'La contraseña no cumple los requisitos mínimos.'],
  [/rate limit/i, 'Se hicieron demasiados intentos. Esperá un momento y volvé a intentar.'],
]

function extractMessage(error: unknown): { code?: string; message?: string } {
  if (!error || typeof error !== 'object') return {}
  const code = 'code' in error && error.code != null ? String((error as { code: unknown }).code) : undefined
  const message = 'message' in error && error.message != null ? String((error as { message: unknown }).message) : undefined
  return { code, message }
}

export function friendlyError(
  error: unknown,
  fallback = 'Ocurrió un error. Intentá de nuevo en unos minutos.',
): string {
  const { code, message } = extractMessage(error)

  if (code && PG_CODE_MESSAGES[code]) return PG_CODE_MESSAGES[code]

  if (message) {
    for (const [pattern, friendly] of MESSAGE_PATTERNS) {
      if (pattern.test(message)) return friendly
    }
  }

  // Nada matcheó — el usuario ve el mensaje genérico, pero acá queda el
  // error real en los logs del server (Vercel > proyecto > Logs) para
  // poder diagnosticarlo después en vez de quedar a ciegas.
  console.error('[friendlyError] sin traducción conocida:', { code, message, error })

  return fallback
}
