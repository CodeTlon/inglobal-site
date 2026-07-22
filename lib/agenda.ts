/**
 * lib/agenda.ts — Capa de acceso a datos de la Agenda de Grúas.
 *
 * A diferencia de lib/content.ts (contenido público, cliente anon + fallback estático),
 * estas tablas son 100% privadas (RLS solo `authenticated`, sin policy pública) — se leen
 * SIEMPRE con el cliente de servidor (cookies de sesión), nunca con el cliente anon, y sin
 * fallback: si no hay sesión, Supabase devuelve vacío/error por RLS.
 */

import { createSupabaseServerClient } from '@/lib/supabase-server'

export interface Grua {
  id: string
  nombre: string
  patente: string | null
  capacidad_toneladas: number | null
  tipo: string
  activo: boolean
  created_at: string
}

export interface EmpresaAgenda {
  id: string
  nombre: string
  contacto: string | null
  telefono: string | null
  notas: string | null
  activo: boolean
  created_at: string
}

export interface Operario {
  id: string
  nombre: string
  telefono: string | null
  activo: boolean
  created_at: string
}

export interface EventoAgenda {
  id: string
  fecha: string
  fecha_hasta: string | null
  hora_inicio: string
  hora_fin: string | null
  grua_id: string
  empresa_id: string
  ubicacion: string | null
  notas: string | null
  estado: string
  created_at: string
  updated_at: string
  grua: { nombre: string } | null
  empresa: { nombre: string } | null
  operarios: { id: string; nombre: string }[]
}

export async function getGruas({ includeInactive = false } = {}): Promise<Grua[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase.from('gruas').select('*')
  if (!includeInactive) query = query.eq('activo', true)
  const { data, error } = await query.order('nombre', { ascending: true })
  if (error || !data) return []
  return data as Grua[]
}

export async function getEmpresasAgenda({ includeInactive = false } = {}): Promise<EmpresaAgenda[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase.from('empresas_agenda').select('*')
  if (!includeInactive) query = query.eq('activo', true)
  const { data, error } = await query.order('nombre', { ascending: true })
  if (error || !data) return []
  return data as EmpresaAgenda[]
}

export async function getOperarios({ includeInactive = false } = {}): Promise<Operario[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase.from('operarios').select('*')
  if (!includeInactive) query = query.eq('activo', true)
  const { data, error } = await query.order('nombre', { ascending: true })
  if (error || !data) return []
  return data as Operario[]
}

const EVENTO_SELECT =
  '*, grua:gruas(nombre), empresa:empresas_agenda(nombre), eventos_operarios(operario:operarios(id, nombre))'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEvento(row: any): EventoAgenda {
  return {
    ...row,
    operarios: (row.eventos_operarios ?? []).map((eo: { operario: { id: string; nombre: string } }) => eo.operario).filter(Boolean),
  }
}

/**
 * Eventos ordenados por fecha/hora ascendente. `desde`/`hasta` filtran por fecha
 * (YYYY-MM-DD), inclusive — un evento de varios días (fecha_hasta) matchea si su
 * rango se solapa con la ventana pedida, no sólo si empieza adentro (si no, un
 * evento que arrancó antes de `desde` pero sigue vigente desaparecía de la vista).
 */
export async function getEventosAgenda({ desde, hasta }: { desde?: string; hasta?: string } = {}): Promise<EventoAgenda[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase.from('eventos_agenda').select(EVENTO_SELECT)
  if (hasta) query = query.lte('fecha', hasta)
  if (desde) query = query.or(`fecha_hasta.gte.${desde},and(fecha_hasta.is.null,fecha.gte.${desde})`)
  const { data, error } = await query
    .order('fecha', { ascending: true })
    .order('hora_inicio', { ascending: true })
  if (error || !data) return []
  return data.map(mapEvento)
}

export async function getEventoAgendaById(id: string): Promise<EventoAgenda | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('eventos_agenda')
    .select(EVENTO_SELECT)
    .eq('id', id)
    .single()
  if (error || !data) return null
  return mapEvento(data)
}
