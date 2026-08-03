/**
 * lib/clientes-business.ts — Helpers de clientes reutilizados por Server Actions
 * (app/actions/clientes.ts) y Route Handlers (app/api/clientes/**).
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export async function uniqueSlug(supabase: SupabaseClient, base: string, excludeId?: string): Promise<string> {
  let slug = base
  let n = 2
  while (true) {
    const { data } = await supabase.from('clientes').select('id').eq('slug', slug).limit(1)
    if (!data || data.length === 0) return slug
    if (excludeId && data[0].id === excludeId) return slug
    slug = `${base}-${n++}`
  }
}
