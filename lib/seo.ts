import { paginaPedida, paginar } from './paginacion'

/** Imagen para compartir cuando una ficha no tiene portada propia. */
export const OG_FALLBACK = '/images/og-image.jpg'

/** Canonical de una lista paginada: la página 1 es la ruta limpia, las demás llevan `?pagina=N`. */
export function canonicalPagina(base: string, pagina: number): string {
  return pagina > 1 ? `${base}?pagina=${pagina}` : base
}

/** Página efectiva (acotada al rango real) de una lista, para el canonical y el título. */
export function paginaEfectiva(total: number, pedida: string | undefined, porPagina: number): number {
  return paginar(new Array(total), paginaPedida(pedida), porPagina).pagina
}

/** `openGraph.images` de una ficha: su portada si existe, si no la imagen general del sitio (si no, WhatsApp comparte sin imagen). */
export function ogImages(...candidatas: (string | null | undefined)[]): { url: string }[] {
  return [{ url: candidatas.find(Boolean) ?? OG_FALLBACK }]
}
