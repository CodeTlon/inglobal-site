/**
 * lib/agenda.ts — Capa de acceso a datos de la Agenda de Grúas.
 *
 * A diferencia de lib/content.ts (contenido público, cliente anon + fallback estático),
 * estas tablas son 100% privadas (RLS solo `authenticated`, sin policy pública) — se leen
 * SIEMPRE con un cliente autenticado, nunca con el cliente anon, y sin fallback: si no hay
 * sesión, Supabase devuelve vacío/error por RLS.
 *
 * Cada getter acepta un `supabase` opcional al final — por defecto usa el cliente
 * cookie-based (Server Components/Actions del dashboard web); los Route Handlers de
 * app/api/agenda/** le pasan el cliente Bearer-based (lib/supabase-api.ts) para que la
 * app mobile lea exactamente los mismos datos con el mismo RLS, sin duplicar queries.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { estadoTransicionado } from '@/lib/agenda-business'

async function resolveClient(supabase?: SupabaseClient) {
  return supabase ?? (await createSupabaseServerClient())
}

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

export async function getGruas({ includeInactive = false } = {}, supabase?: SupabaseClient): Promise<Grua[]> {
  const client = await resolveClient(supabase)
  let query = client.from('gruas').select('*')
  if (!includeInactive) query = query.eq('activo', true)
  const { data, error } = await query.order('nombre', { ascending: true })
  if (error || !data) return []
  return data as Grua[]
}

export async function getEmpresasAgenda({ includeInactive = false } = {}, supabase?: SupabaseClient): Promise<EmpresaAgenda[]> {
  const client = await resolveClient(supabase)
  let query = client.from('empresas_agenda').select('*')
  if (!includeInactive) query = query.eq('activo', true)
  const { data, error } = await query.order('nombre', { ascending: true })
  if (error || !data) return []
  return data as EmpresaAgenda[]
}

export async function getOperarios({ includeInactive = false } = {}, supabase?: SupabaseClient): Promise<Operario[]> {
  const client = await resolveClient(supabase)
  let query = client.from('operarios').select('*')
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
 * Si el evento debería tener otro estado a esta hora (ver estadoTransicionado),
 * lo persiste (lazy, on-read — no hace falta cron) y lo refleja en el objeto que
 * se devuelve. Best-effort: si el update falla, igual se muestra el estado
 * correcto en esta respuesta, no se bloquea la lectura por eso.
 */
async function aplicarTransicionEstado(evento: EventoAgenda, client: SupabaseClient): Promise<void> {
  const nuevo = estadoTransicionado(evento)
  if (!nuevo) return
  const { error } = await client.from('eventos_agenda').update({ estado: nuevo }).eq('id', evento.id)
  if (!error) evento.estado = nuevo
}

/**
 * Eventos ordenados por fecha/hora ascendente. `desde`/`hasta` filtran por fecha
 * (YYYY-MM-DD), inclusive — un evento de varios días (fecha_hasta) matchea si su
 * rango se solapa con la ventana pedida, no sólo si empieza adentro (si no, un
 * evento que arrancó antes de `desde` pero sigue vigente desaparecía de la vista).
 */
export async function getEventosAgenda(
  { desde, hasta }: { desde?: string; hasta?: string } = {},
  supabase?: SupabaseClient,
): Promise<EventoAgenda[]> {
  const client = await resolveClient(supabase)
  let query = client.from('eventos_agenda').select(EVENTO_SELECT)
  if (hasta) query = query.lte('fecha', hasta)
  if (desde) query = query.or(`fecha_hasta.gte.${desde},and(fecha_hasta.is.null,fecha.gte.${desde})`)
  const { data, error } = await query
    .order('fecha', { ascending: true })
    .order('hora_inicio', { ascending: true })
  if (error || !data) return []
  const eventos = data.map(mapEvento)
  await Promise.all(eventos.map((ev) => aplicarTransicionEstado(ev, client)))
  return eventos
}

export async function getEventoAgendaById(id: string, supabase?: SupabaseClient): Promise<EventoAgenda | null> {
  const client = await resolveClient(supabase)
  const { data, error } = await client
    .from('eventos_agenda')
    .select(EVENTO_SELECT)
    .eq('id', id)
    .single()
  if (error || !data) return null
  const evento = mapEvento(data)
  await aplicarTransicionEstado(evento, client)
  return evento
}
