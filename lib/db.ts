/**
 * lib/db.ts — acceso a Postgres propio (reemplaza a @supabase/supabase-js para datos).
 *
 * Es una capa chica sobre `pg` con la misma forma de uso que tenía el cliente de
 * Supabase (`db.from('tabla').select(...).eq(...).single()`), para que las filas
 * lleguen EXACTAMENTE con la forma que ya espera toda la UI (snake_case, números
 * como number, fechas como ISO). Cada fila se arma en SQL con jsonb, igual que
 * hacía PostgREST.
 *
 * Seguridad:
 *  - Los valores van SIEMPRE como parámetros ($n), nunca concatenados.
 *  - Tablas y columnas se validan contra una lista/regex antes de entrar al SQL.
 *  - No hay RLS: la autorización vive en el servidor (requireUser en cada
 *    Server Action / Route Handler).
 *
 * Soporta solo lo que el proyecto usa: select con relaciones anidadas
 * (alias:tabla(cols)), eq/neq/gt/gte/lt/lte/in/is/not/ilike/like/or, order,
 * limit, single/maybeSingle, insert/update/delete/upsert y count exacto.
 * El esquema y las migraciones son de Drizzle (db/schema.ts, drizzle/).
 */

import { Pool, type QueryResultRow } from 'pg'

// ─── Pool ──────────────────────────────────────────────────────────────────

const globalForDb = globalThis as unknown as { pgPool?: Pool }

function getPool(): Pool {
  if (!globalForDb.pgPool) {
    // Placeholder: el build no necesita una base real, las consultas ocurren en runtime.
    globalForDb.pgPool = new Pool({
      connectionString: process.env.DATABASE_URL ?? 'postgres://placeholder:placeholder@localhost:5432/placeholder',
      max: Number(process.env.DATABASE_POOL_MAX ?? 5),
      ssl: process.env.DATABASE_SSL === 'require' ? { rejectUnauthorized: false } : undefined,
    })
  }
  return globalForDb.pgPool
}

// ─── Metadatos del esquema ─────────────────────────────────────────────────

export const TABLES = [
  'contact_leads', 'site_settings', 'clientes', 'montajes', 'servicios', 'trabajos', 'galeria',
  'gruas', 'empresas_agenda', 'operarios', 'eventos_agenda', 'eventos_operarios', 'eventos_gruas',
  'tv_pairing_codes', 'push_tokens', 'notificaciones_enviadas',
  'user', 'session', 'account', 'verification',
] as const
export type TableName = (typeof TABLES)[number]

type Relation = { kind: 'one' | 'many'; local: string; foreign: string }

/** Relaciones navegables en select(): RELATIONS[desde][hacia]. Espejo de las FK del esquema. */
const RELATIONS: Record<string, Record<string, Relation>> = {
  eventos_agenda: {
    gruas: { kind: 'one', local: 'grua_id', foreign: 'id' },
    empresas_agenda: { kind: 'one', local: 'empresa_id', foreign: 'id' },
    eventos_operarios: { kind: 'many', local: 'id', foreign: 'evento_id' },
    eventos_gruas: { kind: 'many', local: 'id', foreign: 'evento_id' },
  },
  eventos_gruas: {
    eventos_agenda: { kind: 'one', local: 'evento_id', foreign: 'id' },
    gruas: { kind: 'one', local: 'grua_id', foreign: 'id' },
  },
  eventos_operarios: {
    eventos_agenda: { kind: 'one', local: 'evento_id', foreign: 'id' },
    operarios: { kind: 'one', local: 'operario_id', foreign: 'id' },
  },
  operarios: { eventos_operarios: { kind: 'many', local: 'id', foreign: 'operario_id' } },
  gruas: {
    eventos_agenda: { kind: 'many', local: 'id', foreign: 'grua_id' },
    eventos_gruas: { kind: 'many', local: 'id', foreign: 'grua_id' },
  },
  empresas_agenda: { eventos_agenda: { kind: 'many', local: 'id', foreign: 'empresa_id' } },
  clientes: { trabajos: { kind: 'many', local: 'id', foreign: 'cliente_id' } },
  trabajos: { clientes: { kind: 'one', local: 'cliente_id', foreign: 'id' } },
}

// ─── Errores y resultado ───────────────────────────────────────────────────

export type DbError = { message: string; code?: string; details?: string }
export type DbResult<T = any> = { data: T | null; error: DbError | null; count: number | null } // eslint-disable-line @typescript-eslint/no-explicit-any

function toDbError(e: unknown): DbError {
  const err = e as { message?: string; code?: string; detail?: string }
  return { message: err.message ?? 'Error de base de datos', code: err.code, details: err.detail }
}

// ─── Identificadores ───────────────────────────────────────────────────────

const IDENT = /^[a-z_][a-z0-9_]*$/i

function ident(name: string): string {
  if (!IDENT.test(name)) throw new Error(`Identificador inválido: ${name}`)
  return `"${name}"`
}

function tableIdent(name: string): string {
  if (!(TABLES as readonly string[]).includes(name)) throw new Error(`Tabla desconocida: ${name}`)
  return `"${name}"`
}

// ─── Parser del select() ───────────────────────────────────────────────────

type SelectNode = {
  columns: string[] // columnas planas; '*' = todas
  embeds: { alias: string; table: string; node: SelectNode }[]
}

function splitTopLevel(input: string, sep = ','): string[] {
  const parts: string[] = []
  let depth = 0
  let cur = ''
  for (const ch of input) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (ch === sep && depth === 0) {
      parts.push(cur)
      cur = ''
    } else cur += ch
  }
  if (cur.trim()) parts.push(cur)
  return parts.map((p) => p.trim()).filter(Boolean)
}

export function parseSelect(input: string): SelectNode {
  const node: SelectNode = { columns: [], embeds: [] }
  for (const item of splitTopLevel(input)) {
    const open = item.indexOf('(')
    if (open === -1) {
      node.columns.push(item)
      continue
    }
    const head = item.slice(0, open)
    const inner = item.slice(open + 1, item.lastIndexOf(')'))
    const [alias, table] = head.includes(':') ? head.split(':') : [head, head]
    node.embeds.push({ alias: alias.trim(), table: table.trim(), node: parseSelect(inner) })
  }
  return node
}

/** Expresión jsonb de una fila `alias` según el árbol de select. */
function rowExpr(node: SelectNode, table: string, alias: string, depth = 0): string {
  const parts: string[] = []
  const star = node.columns.includes('*')
  const cols = node.columns.filter((c) => c !== '*')
  for (const c of cols) parts.push(`${quoteLiteral(c)}, ${alias}.${ident(c)}`)

  for (const emb of node.embeds) {
    const rel = RELATIONS[table]?.[emb.table]
    if (!rel) throw new Error(`Relación no soportada: ${table} -> ${emb.table}`)
    const sub = `r${depth}`
    const inner = rowExpr(emb.node, emb.table, sub, depth + 1)
    const where = `${sub}.${ident(rel.foreign)} = ${alias}.${ident(rel.local)}`
    const subquery =
      rel.kind === 'one'
        ? `(select ${inner} from ${tableIdent(emb.table)} ${sub} where ${where} limit 1)`
        : `coalesce((select jsonb_agg(${inner}) from ${tableIdent(emb.table)} ${sub} where ${where}), '[]'::jsonb)`
    parts.push(`${quoteLiteral(emb.alias)}, ${subquery}`)
  }

  const built = parts.length ? `jsonb_build_object(${parts.join(', ')})` : null
  if (star) return built ? `(to_jsonb(${alias}) || ${built})` : `to_jsonb(${alias})`
  return built ?? `'{}'::jsonb`
}

function quoteLiteral(s: string): string {
  if (!IDENT.test(s)) throw new Error(`Literal inválido: ${s}`)
  return `'${s}'`
}

// ─── Filtros ───────────────────────────────────────────────────────────────

type Params = unknown[]
type Filter = (params: Params, alias: string) => string

function param(params: Params, value: unknown): string {
  params.push(value)
  return `$${params.length}`
}

function comparison(op: string, col: string, value: unknown, alias: string, params: Params): string {
  const c = `${alias}.${ident(col)}`
  switch (op) {
    case 'eq': return `${c} = ${param(params, value)}`
    case 'neq': return `${c} <> ${param(params, value)}`
    case 'gt': return `${c} > ${param(params, value)}`
    case 'gte': return `${c} >= ${param(params, value)}`
    case 'lt': return `${c} < ${param(params, value)}`
    case 'lte': return `${c} <= ${param(params, value)}`
    case 'like': return `${c} like ${param(params, value)}`
    case 'ilike': return `${c} ilike ${param(params, value)}`
    case 'in': return `${c} = any(${param(params, value)})`
    case 'is': {
      if (value === null || value === 'null') return `${c} is null`
      if (value === true || value === 'true') return `${c} is true`
      if (value === false || value === 'false') return `${c} is false`
      throw new Error('is() solo acepta null/true/false')
    }
    default: throw new Error(`Operador no soportado: ${op}`)
  }
}

/** Parser de la sintaxis `or()` de PostgREST: "a.gte.X,and(b.is.null,c.gte.Y)". */
function orExpr(expr: string, alias: string, params: Params): string {
  const terms = splitTopLevel(expr).map((t) => {
    const group = t.match(/^(and|or)\(([\s\S]*)\)$/)
    if (group) {
      const inner = splitTopLevel(group[2]).map((x) => orExpr(x, alias, params))
      return `(${inner.join(group[1] === 'and' ? ' and ' : ' or ')})`
    }
    const m = t.match(/^([a-z_][a-z0-9_]*)\.([a-z]+)\.([\s\S]*)$/i)
    if (!m) throw new Error(`Condición or() inválida: ${t}`)
    const [, col, op, raw] = m
    const value = op === 'in' ? raw.replace(/^\(|\)$/g, '').split(',') : raw
    return comparison(op, col, value, alias, params)
  })
  return terms.length === 1 ? terms[0] : `(${terms.join(' or ')})`
}

// ─── Query builder ─────────────────────────────────────────────────────────

type Mode = 'select' | 'insert' | 'update' | 'delete' | 'upsert'

class Query<T = any[]> implements PromiseLike<DbResult<T>> { // eslint-disable-line @typescript-eslint/no-explicit-any
  private mode: Mode = 'select'
  private selectStr: string | null = '*'
  private returning = false
  private filters: Filter[] = []
  private orders: { col: string; asc: boolean; nullsFirst?: boolean }[] = []
  private limitN: number | null = null
  private offsetN = 0
  private payload: Record<string, unknown>[] | Record<string, unknown> | null = null
  private conflict: string | null = null
  private countExact = false
  private head = false
  private shape: 'many' | 'single' | 'maybeSingle' = 'many'

  constructor(private table: string) {
    tableIdent(table)
  }

  select(cols = '*', opts?: { count?: 'exact'; head?: boolean }) {
    if (this.mode === 'select') this.selectStr = cols
    else {
      this.returning = true
      this.selectStr = cols
    }
    if (opts?.count === 'exact') this.countExact = true
    if (opts?.head) this.head = true
    return this
  }

  insert(values: Record<string, unknown> | Record<string, unknown>[]) {
    this.mode = 'insert'
    this.payload = values
    this.selectStr = null
    return this
  }

  upsert(values: Record<string, unknown> | Record<string, unknown>[], opts?: { onConflict?: string }) {
    this.mode = 'upsert'
    this.payload = values
    this.conflict = opts?.onConflict ?? null
    this.selectStr = null
    return this
  }

  update(values: Record<string, unknown>) {
    this.mode = 'update'
    this.payload = values
    this.selectStr = null
    return this
  }

  delete() {
    this.mode = 'delete'
    this.selectStr = null
    return this
  }

  private where(op: string, col: string, value: unknown) {
    this.filters.push((params, alias) => comparison(op, col, value, alias, params))
    return this
  }

  eq(col: string, v: unknown) { return this.where('eq', col, v) }
  neq(col: string, v: unknown) { return this.where('neq', col, v) }
  gt(col: string, v: unknown) { return this.where('gt', col, v) }
  gte(col: string, v: unknown) { return this.where('gte', col, v) }
  lt(col: string, v: unknown) { return this.where('lt', col, v) }
  lte(col: string, v: unknown) { return this.where('lte', col, v) }
  like(col: string, v: string) { return this.where('like', col, v) }
  ilike(col: string, v: string) { return this.where('ilike', col, v) }
  in(col: string, v: unknown[]) { return this.where('in', col, v) }
  is(col: string, v: null | boolean) { return this.where('is', col, v) }

  not(col: string, op: string, value: unknown) {
    this.filters.push((params, alias) => `not (${comparison(op, col, value, alias, params)})`)
    return this
  }

  or(expr: string) {
    this.filters.push((params, alias) => orExpr(expr, alias, params))
    return this
  }

  order(col: string, opts?: { ascending?: boolean; nullsFirst?: boolean }) {
    this.orders.push({ col, asc: opts?.ascending !== false, nullsFirst: opts?.nullsFirst })
    return this
  }

  limit(n: number) {
    this.limitN = n
    return this
  }

  /** Salta `n` filas (paginación); va junto con `limit` y un `order` estable. */
  offset(n: number) {
    this.offsetN = Math.max(0, Math.floor(n))
    return this
  }

  single(): Query<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
    this.shape = 'single'
    return this as unknown as Query<any> // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  maybeSingle(): Query<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
    this.shape = 'maybeSingle'
    return this as unknown as Query<any> // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  // ── Construcción del SQL ──

  private buildWhere(params: Params): string {
    const parts = this.filters.map((f) => f(params, 't'))
    return parts.length ? ` where ${parts.join(' and ')}` : ''
  }

  private buildTail(): string {
    let sql = ''
    if (this.orders.length) {
      sql += ' order by ' + this.orders
        .map((o) => `t.${ident(o.col)} ${o.asc ? 'asc' : 'desc'}${o.nullsFirst === undefined ? '' : o.nullsFirst ? ' nulls first' : ' nulls last'}`)
        .join(', ')
    }
    if (this.limitN !== null) sql += ` limit ${Math.max(0, Math.floor(this.limitN))}`
    if (this.offsetN > 0) sql += ` offset ${this.offsetN}`
    return sql
  }

  private build(): { sql: string; params: Params } {
    const params: Params = []
    const tbl = tableIdent(this.table)
    const expr = () => rowExpr(parseSelect(this.selectStr ?? '*'), this.table, 't')

    if (this.mode === 'select') {
      const where = this.buildWhere(params)
      if (this.head) return { sql: `select count(*)::int as n from ${tbl} t${where}`, params }
      const count = this.countExact ? `, count(*) over()::int as n` : ''
      return { sql: `select ${expr()} as r${count} from ${tbl} t${where}${this.buildTail()}`, params }
    }

    let stmt: string
    if (this.mode === 'delete') {
      stmt = `delete from ${tbl} t${this.buildWhere(params)}`
    } else if (this.mode === 'update') {
      const values = this.payload as Record<string, unknown>
      const cols = Object.keys(values)
      if (!cols.length) throw new Error('update() sin valores')
      const p = param(params, JSON.stringify(values))
      const list = cols.map(ident).join(', ')
      stmt =
        `update ${tbl} t set (${list}) = (select ${cols.map((c) => `v.${ident(c)}`).join(', ')} ` +
        `from jsonb_populate_record(null::${tbl}, ${p}::jsonb) v)${this.buildWhere(params)}`
    } else {
      const rows = Array.isArray(this.payload) ? this.payload : [this.payload as Record<string, unknown>]
      const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))]
      if (!cols.length) throw new Error('insert() sin valores')
      const p = param(params, JSON.stringify(rows))
      const list = cols.map(ident).join(', ')
      stmt =
        `insert into ${tbl} (${list}) select ${list} from jsonb_populate_recordset(null::${tbl}, ${p}::jsonb)`
      if (this.mode === 'upsert') {
        const target = this.conflict ?? (this.table === 'site_settings' ? 'key' : 'id')
        const targets = target.split(',').map((c) => c.trim())
        const sets = cols.filter((c) => !targets.includes(c)).map((c) => `${ident(c)} = excluded.${ident(c)}`)
        stmt += ` on conflict (${targets.map(ident).join(', ')}) ` + (sets.length ? `do update set ${sets.join(', ')}` : 'do nothing')
      }
    }

    if (!this.returning) return { sql: stmt, params }
    return { sql: `with m as (${stmt} returning *) select ${expr()} as r from m t`, params }
  }

  // ── Ejecución ──

  private async run(): Promise<DbResult<T>> {
    try {
      const { sql, params } = this.build()
      const res = await getPool().query<QueryResultRow>(sql, params)

      if (this.mode !== 'select' && !this.returning) return { data: null, error: null, count: res.rowCount } as DbResult<T>
      if (this.head) return { data: null, error: null, count: res.rows[0]?.n ?? 0 } as DbResult<T>

      const rows = res.rows.map((r) => r.r)
      const count = this.countExact ? (res.rows[0]?.n ?? 0) : null

      if (this.shape === 'many') return { data: rows as unknown as T, error: null, count }
      if (rows.length === 1) return { data: rows[0] as T, error: null, count }
      if (rows.length === 0 && this.shape === 'maybeSingle') return { data: null, error: null, count }
      return {
        data: null,
        count,
        error: {
          code: 'PGRST116',
          message: 'JSON object requested, multiple (or no) rows returned',
          details: `The result contains ${rows.length} rows`,
        },
      }
    } catch (e) {
      return { data: null, error: toDbError(e), count: null }
    }
  }

  then<R1 = DbResult<T>, R2 = never>(
    onfulfilled?: ((value: DbResult<T>) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
  ): PromiseLike<R1 | R2> {
    return this.run().then(onfulfilled, onrejected)
  }
}

export const db = {
  from(table: string) {
    return new Query(table)
  },
  /** Para scripts y transacciones puntuales. */
  pool: getPool,
}

export type Db = typeof db
