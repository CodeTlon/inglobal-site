import crypto from 'crypto'

/**
 * Código de 6 dígitos que muestran a la vez la TV (debajo del QR) y la app (antes de "Aprobar"), para que
 * quien aprueba compruebe que el QR escaneado es el de la TV que tiene adelante y no uno ajeno: aprobar le da
 * a la TV una sesión completa de su cuenta. Se deriva del token (no hace falta guardarlo ni migrar la tabla)
 * y solo lo calcula el servidor.
 */
export function codigoDeVinculacion(token: string): string {
  const n = crypto.createHash('sha256').update(`tv-pair:${token}`).digest().readUInt32BE(0) % 1_000_000
  const s = String(n).padStart(6, '0')
  return `${s.slice(0, 3)} ${s.slice(3)}`
}
