/**
 * lib/servicios-business.ts — Helpers de servicios reutilizados por Server Actions
 * (app/actions/servicios.ts) y Route Handlers (app/api/servicios/**).
 */

import type { Db } from '@/lib/db'

export async function uniqueSlug(db: Db, base: string, excludeId?: string): Promise<string> {
  let slug = base
  let n = 2
  while (true) {
    const { data } = await db.from('servicios').select('id').eq('slug', slug).limit(1)
    if (!data || data.length === 0) return slug
    if (excludeId && data[0].id === excludeId) return slug
    slug = `${base}-${n++}`
  }
}

export async function titleExists(db: Db, title: string, excludeId?: string): Promise<boolean> {
  let query = db.from('servicios').select('id').ilike('title', title)
  if (excludeId) query = query.neq('id', excludeId)
  const { data } = await query.limit(1)
  return !!data && data.length > 0
}

// StringList (Field.tsx) serializa el input oculto como JSON — no texto
// separado por saltos de línea.
export function parseSpecs(raw: string | undefined): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string' && s.trim() !== '') : []
  } catch {
    return []
  }
}
