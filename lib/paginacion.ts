/** Número de página pedido en `?pagina=` (entero ≥ 1; cualquier otra cosa vale 1). */
export function paginaPedida(valor: string | undefined): number {
  const n = Math.floor(Number(valor))
  return Number.isFinite(n) && n >= 1 ? n : 1
}

/** Corta una lista ya cargada en páginas. `pagina` se acota al rango válido. */
export function paginar<T>(items: T[], pagina: number, porPagina: number): { items: T[]; pagina: number; totalPaginas: number } {
  const totalPaginas = Math.max(1, Math.ceil(items.length / porPagina))
  const actual = Math.min(Math.max(1, pagina), totalPaginas)
  return { items: items.slice((actual - 1) * porPagina, actual * porPagina), pagina: actual, totalPaginas }
}
