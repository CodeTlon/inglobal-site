import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Si `value` ya está usado por otra fila (mismo scope, si aplica), devuelve el
 * siguiente entero libre. Evita que dos registros con el mismo display_order
 * se pisen en el ordenamiento en vez de bloquear el guardado.
 */
export async function nextFreeOrder(
  supabase: SupabaseClient,
  table: string,
  column: string,
  value: number,
  opts: { scopeColumn?: string; scopeValue?: string; excludeId?: string } = {},
): Promise<number> {
  const { scopeColumn, scopeValue, excludeId } = opts
  let candidate = value
  while (true) {
    let query = supabase.from(table).select('id').eq(column, candidate)
    if (scopeColumn && scopeValue) query = query.eq(scopeColumn, scopeValue)
    if (excludeId) query = query.neq('id', excludeId)
    const { data } = await query.limit(1)
    if (!data || data.length === 0) return candidate
    candidate++
  }
}
