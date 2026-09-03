/**
 * Limpieza best-effort del Service Worker/Cache Storage del PWA (public/sw.js) al
 * cerrar sesión del dashboard.
 *
 * Por qué: sw.js cachea cualquier GET exitoso dentro de scope /dashboard/ (network-first
 * con fallback a cache, sin expiración — ver Quirks en .claude/CLAUDE.md) y signOut()
 * (app/actions/auth.ts) no tocaba ese cache. En un dispositivo compartido (el caso real
 * es agenda-tv/PWA instalada en el celular de un operario) eso significa que, si el
 * dispositivo queda offline después de un logout o de que se revoque el acceso, el SW
 * seguía sirviendo el último HTML/JSON cacheado de la agenda sin pasar por el middleware
 * de auth (que solo corre en requests reales al server, no en respuestas servidas desde
 * Cache Storage).
 *
 * Se llama client-side (Server Actions no tienen acceso a `caches`/`navigator`) desde el
 * form de logout, en paralelo al submit real (no bloquea el `redirect()` del server action
 * ni falla si el browser no soporta algo de esto).
 */
export async function clearPwaCache(): Promise<void> {
  if (typeof window === 'undefined') return

  if ('caches' in window) {
    try {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
    } catch {
      // best-effort — un fallo acá nunca debe impedir el logout
    }
  }

  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((registration) => registration.unregister()))
    } catch {
      // best-effort — RegisterSW.tsx lo vuelve a registrar solo en el próximo mount
      // (está en el layout raíz, así que corre también en /dashboard/login)
    }
  }
}
