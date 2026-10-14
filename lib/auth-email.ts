import { db } from '@/lib/db'

/**
 * Chequeo de existencia de un email entre las cuentas del panel.
 *
 * IMPORTANTE — para qué SÍ y para qué NO se usa esto:
 *  - SÍ: decidir si, tras un login fallido, se limpia el campo email del form
 *    (email inexistente) o se conserva para que el usuario reintente solo la
 *    contraseña (email existente).
 *  - NO: cambiar el texto del error mostrado al usuario. El mensaje debe ser
 *    IDÉNTICO en los dos casos — si el texto variara, cualquiera podría
 *    enumerar qué cuentas existen probando emails contra el login.
 *
 * Solo servidor.
 */

/** Formato de email — mismo criterio laxo que el `type="email"` del navegador. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmailFormat(email: string): boolean {
  return email.length > 0 && email.length <= 254 && EMAIL_RE.test(email)
}

/**
 * ¿Existe una cuenta con este email? `null` si no se pudo determinar (error de
 * la base): el que llama debe ser conservador y NO borrar el email tipeado.
 */
export async function emailExistsInAuth(email: string): Promise<boolean | null> {
  const target = email.trim().toLowerCase()
  if (!isValidEmailFormat(target)) return false

  const { data, error } = await db.from('user').select('id').eq('email', target).limit(1)
  if (error) {
    console.error('emailExistsInAuth error:', error.message)
    return null
  }
  return (data?.length ?? 0) > 0
}
