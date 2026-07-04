/**
 * lib/content.ts — Capa de acceso a datos para el sitio de InGlobal.
 *
 * Contrato de tipos e interfaces consumido por el frontend y el dashboard.
 * Siempre con fallback a datos estáticos si Supabase falla o no está configurado.
 */

import { createSupabaseClient } from '@/lib/supabase'
import {
  FALLBACK_SITE_SETTINGS,
  FALLBACK_MONTAJES,
  FALLBACK_CLIENTES,
  FALLBACK_SERVICIOS,
} from '@/lib/constants'

// ─────────────────────────────────────────────────────────────
// Tipos exportados — usados en constants.ts y por el frontend
// ─────────────────────────────────────────────────────────────

export interface Montaje {
  id:            string
  slug:          string
  title:         string
  excerpt:       string | null
  content:       string | null
  cover_image:   string | null
  tags:          string[]
  display_order: number
  published:     boolean
  created_at:    string
  updated_at:    string
}

export interface Cliente {
  id:          string
  slug:        string
  name:        string
  logo:        string
  bio:         string | null
  content:     string | null
  featured:    boolean
  work_rank:   number
  published:   boolean
  created_at:  string
  updated_at:  string
}

export interface Servicio {
  id:            string
  slug:          string
  title:         string
  desc:          string
  specs:         string[]
  img:           string
  icon:          string
  display_order: number
  published:     boolean
  created_at:    string
  updated_at:    string
}

/** Un "trabajo" (proyecto/artículo) hecho para un cliente puntual. */
export interface Trabajo {
  id:            string
  cliente_id:    string
  slug:          string
  title:         string
  excerpt:       string | null
  content:       string
  cover_image:   string | null
  youtube_url:   string | null
  display_order: number
  published:     boolean
  created_at:    string
  updated_at:    string
}

// ─────────────────────────────────────────────────────────────
// Helper: detectar si Supabase está configurado
// ─────────────────────────────────────────────────────────────
function isPlaceholder(): boolean {
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
  )
}

// ─────────────────────────────────────────────────────────────
// site_settings
// ─────────────────────────────────────────────────────────────

type SiteSettingsKey =
  | 'hero'
  | 'quienes_somos'
  | 'que_hacemos'
  | 'stats'
  | 'cta_banner'
  | 'clientes_destacados'
  | 'ubicacion'
  | 'footer'
  | 'contacto'

/**
 * Devuelve el valor JSON de una clave de site_settings.
 * Puede ser un objeto o un array (e.g. `stats`).
 * Fallback al valor hardcodeado si Supabase no responde.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getSiteSettings(key: SiteSettingsKey): Promise<any> {
  if (isPlaceholder()) return FALLBACK_SITE_SETTINGS[key] ?? {}

  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .single()

    if (error || !data) {
      if (error) console.error(`site_settings[${key}] fetch error:`, error.message)
      return FALLBACK_SITE_SETTINGS[key] ?? {}
    }

    // Para valores objeto: merge con fallback (preserva campos no editados).
    // Para arrays (e.g. stats): devolver el valor de DB directamente.
    const dbVal = data.value
    if (Array.isArray(dbVal)) return dbVal
    const fallback = FALLBACK_SITE_SETTINGS[key] ?? {}
    return { ...fallback, ...dbVal }
  } catch (e) {
    console.error(`site_settings[${key}] unexpected error:`, e)
    return FALLBACK_SITE_SETTINGS[key] ?? {}
  }
}

// ─────────────────────────────────────────────────────────────
// montajes
// ─────────────────────────────────────────────────────────────

/** Todos los montajes publicados, ordenados por display_order ASC. */
export async function getMontajes(): Promise<Montaje[]> {
  if (isPlaceholder()) return FALLBACK_MONTAJES

  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('montajes')
      .select('*')
      .eq('published', true)
      .order('display_order', { ascending: true })

    if (error || !data || data.length === 0) {
      if (error) console.error('montajes fetch error:', error.message)
      return FALLBACK_MONTAJES
    }
    return data as Montaje[]
  } catch (e) {
    console.error('montajes unexpected error:', e)
    return FALLBACK_MONTAJES
  }
}

/** Un montaje por slug. Null si no existe. */
export async function getMontaje(slug: string): Promise<Montaje | null> {
  if (isPlaceholder()) return FALLBACK_MONTAJES.find((m) => m.slug === slug) ?? null

  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('montajes')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error || !data) {
      if (error) console.error(`montaje[${slug}] fetch error:`, error.message)
      return FALLBACK_MONTAJES.find((m) => m.slug === slug) ?? null
    }
    return data as Montaje
  } catch (e) {
    console.error(`montaje[${slug}] unexpected error:`, e)
    return FALLBACK_MONTAJES.find((m) => m.slug === slug) ?? null
  }
}

// ─────────────────────────────────────────────────────────────
// clientes
// ─────────────────────────────────────────────────────────────

/** Todos los clientes publicados, ordenados por work_rank DESC. */
export async function getClientes(): Promise<Cliente[]> {
  if (isPlaceholder()) return FALLBACK_CLIENTES

  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('published', true)
      .order('work_rank', { ascending: false })

    if (error || !data || data.length === 0) {
      if (error) console.error('clientes fetch error:', error.message)
      return FALLBACK_CLIENTES
    }
    return data as Cliente[]
  } catch (e) {
    console.error('clientes unexpected error:', e)
    return FALLBACK_CLIENTES
  }
}

/** Un cliente por slug. Null si no existe. */
export async function getCliente(slug: string): Promise<Cliente | null> {
  if (isPlaceholder()) return FALLBACK_CLIENTES.find((c) => c.slug === slug) ?? null

  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error || !data) {
      if (error) console.error(`cliente[${slug}] fetch error:`, error.message)
      return FALLBACK_CLIENTES.find((c) => c.slug === slug) ?? null
    }
    return data as Cliente
  } catch (e) {
    console.error(`cliente[${slug}] unexpected error:`, e)
    return FALLBACK_CLIENTES.find((c) => c.slug === slug) ?? null
  }
}

// ─────────────────────────────────────────────────────────────
// servicios
// ─────────────────────────────────────────────────────────────

/** Todos los servicios publicados, ordenados por display_order ASC. */
export async function getServicios(): Promise<Servicio[]> {
  if (isPlaceholder()) return FALLBACK_SERVICIOS

  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('servicios')
      .select('*')
      .eq('published', true)
      .order('display_order', { ascending: true })

    if (error || !data || data.length === 0) {
      if (error) console.error('servicios fetch error:', error.message)
      return FALLBACK_SERVICIOS
    }
    return data as Servicio[]
  } catch (e) {
    console.error('servicios unexpected error:', e)
    return FALLBACK_SERVICIOS
  }
}

// ─────────────────────────────────────────────────────────────
// trabajos (artículos internos de un cliente — "cada cliente es su mini-blog")
// ─────────────────────────────────────────────────────────────
// Sin fallback estático: es contenido puramente CMS, no hay datos previos que preservar.

/** Todos los trabajos publicados de un cliente, ordenados por display_order ASC. */
export async function getTrabajos(clienteId: string): Promise<Trabajo[]> {
  if (isPlaceholder()) return []

  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('trabajos')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('published', true)
      .order('display_order', { ascending: true })

    if (error || !data) {
      if (error) console.error('trabajos fetch error:', error.message)
      return []
    }
    return data as Trabajo[]
  } catch (e) {
    console.error('trabajos unexpected error:', e)
    return []
  }
}

/** Un trabajo publicado por cliente + slug. Null si no existe. */
export async function getTrabajo(clienteId: string, slug: string): Promise<Trabajo | null> {
  if (isPlaceholder()) return null

  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('trabajos')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error || !data) {
      if (error) console.error(`trabajo[${slug}] fetch error:`, error.message)
      return null
    }
    return data as Trabajo
  } catch (e) {
    console.error(`trabajo[${slug}] unexpected error:`, e)
    return null
  }
}

/** Un trabajo por ID (sin filtrar published — uso interno del dashboard). */
export async function getTrabajoById(id: string): Promise<Trabajo | null> {
  if (isPlaceholder()) return null

  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('trabajos')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return data as Trabajo
  } catch (e) {
    console.error(`trabajo[${id}] unexpected error:`, e)
    return null
  }
}
