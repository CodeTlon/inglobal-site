/**
 * IP del cliente para los rate limits. `X-Forwarded-For` lo puede mandar el propio cliente: el primer valor es
 * suyo y rotándolo se saltea el límite. El que agrega el proxy de confianza (Traefik de Coolify) es el ÚLTIMO,
 * así que se usa ese. Si algún día hay un CDN delante, el último salto pasa a ser el del CDN: habría que
 * leer la cabecera propia del CDN (p. ej. `cf-connecting-ip`).
 */
export function clientIp(h: Headers): string {
  const saltos = h.get('x-forwarded-for')?.split(',').map((s) => s.trim()).filter(Boolean)
  return saltos?.[saltos.length - 1] || h.get('x-real-ip')?.trim() || 'unknown'
}
