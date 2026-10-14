/**
 * lib/clientes-business.ts — Helpers de clientes reutilizados por Server Actions
 * (app/actions/clientes.ts) y Route Handlers (app/api/clientes/**).
 */

import type { Db } from '@/lib/db'

export async function uniqueSlug(db: Db, base: string, excludeId?: string): Promise<string> {
  let slug = base
  let n = 2
  while (true) {
    const { data } = await db.from('clientes').select('id').eq('slug', slug).limit(1)
    if (!data || data.length === 0) return slug
    if (excludeId && data[0].id === excludeId) return slug
    slug = `${base}-${n++}`
  }
}
