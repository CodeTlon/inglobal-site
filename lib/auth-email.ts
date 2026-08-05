import { createSupabaseAdminClient } from './supabase-server'

/**
 * Chequeo de existencia de un email en Supabase Auth.
 *
 * IMPORTANTE — para qué SÍ y para qué NO se usa esto:
 *  - SÍ: decidir si, tras un login fallido, se limpia el campo email del form
 *    (email inexistente) o se conserva para que el usuario reintente solo la
 *    contraseña (email existente).
 *  - NO: cambiar el texto del error mostrado al usuario. El mensaje debe ser
 *    IDÉNTICO en los dos casos — si el texto variara, cualquiera podría
 *    enumerar qué cuentas existen probando emails contra el login.
 *
 * Solo servidor: usa el cliente admin (service_role). Nunca importar esto
 * desde un Client Component.
 */

/** Máximo de páginas de `listUsers` a recorrer (200 usuarios por página). */
const MAX_PAGES = 10
const PER_PAGE = 200

/** Formato de email — mismo criterio laxo que el `type="email"` del navegador. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmailFormat(email: string): boolean {
  return email.length > 0 && email.length <= 254 && EMAIL_RE.test(email)
}

/**
 * ¿Existe una cuenta con este email en Supabase Auth?
 *
 * Devuelve `null` si no se pudo determinar (error de la API de Supabase). Ante
 * la duda el criterio del que llama debe ser conservador: NO borrar el email
 * tipeado, para no hacerle perder el dato al usuario por un error nuestro.
 *
 * `supabase-js` no expone un "buscar usuario por email", así que se pagina
 * `listUsers()` (mismo método que ya usa /dashboard/usuarios). El padrón de
 * cuentas de este panel es de decenas, no de miles: alcanza de sobra.
 */
export async function emailExistsInAuth(email: string): Promise<boolean | null> {
  const target = email.trim().toLowerCase()
  if (!isValidEmailFormat(target)) return false

  const admin = createSupabaseAdminClient()

  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: PER_PAGE })
      if (error) {
        console.error('emailExistsInAuth listUsers error:', error.message)
        return null
      }

      const users = data?.users ?? []
      if (users.some((u) => u.email?.trim().toLowerCase() === target)) return true
      if (users.length < PER_PAGE) return false
    }
    // Más usuarios que MAX_PAGES * PER_PAGE: no lo podemos afirmar.
    return null
  } catch (e) {
    console.error('emailExistsInAuth error:', e)
    return null
  }
}
