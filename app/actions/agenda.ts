'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import {
  eventoAgendaSchema,
  gruaSchema,
  empresaAgendaSchema,
  operarioSchema,
} from '@/lib/validations/agenda'

export type AgendaState = { success?: boolean; error?: string } | undefined

type CatalogTable = 'gruas' | 'empresas_agenda' | 'operarios'

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado.')
  return supabase
}

function revalidateEventos() {
  revalidatePath('/dashboard/agenda')
  revalidatePath('/agenda-tv')
}

function revalidateCatalogos() {
  revalidatePath('/dashboard/agenda/catalogos')
  revalidatePath('/dashboard/agenda/nuevo')
  revalidatePath('/dashboard/agenda')
}

function parseOperarioIds(raw: FormDataEntryValue | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(String(raw))
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

async function syncEventoOperarios(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  eventoId: string,
  operarioIds: string[],
): Promise<string | null> {
  const { error: delError } = await supabase.from('eventos_operarios').delete().eq('evento_id', eventoId)
  if (delError) return delError.message
  if (operarioIds.length === 0) return null
  const { error: insError } = await supabase
    .from('eventos_operarios')
    .insert(operarioIds.map((operario_id) => ({ evento_id: eventoId, operario_id })))
  return insError?.message ?? null
}

function parseEventoForm(formData: FormData) {
  return eventoAgendaSchema.safeParse({
    fecha:       formData.get('fecha'),
    hora_inicio: formData.get('hora_inicio'),
    hora_fin:    formData.get('hora_fin'),
    grua_id:     formData.get('grua_id'),
    empresa_id:  formData.get('empresa_id'),
    ubicacion:   formData.get('ubicacion'),
    notas:       formData.get('notas'),
    estado:      formData.get('estado'),
  })
}

// ─── Eventos ────────────────────────────────────────────────────────────────

export async function createEvento(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const supabase = await requireUser()
    const parsed = parseEventoForm(formData)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

    const { hora_fin, ...rest } = parsed.data
    const { data, error } = await supabase
      .from('eventos_agenda')
      .insert({ ...rest, hora_fin: hora_fin || null })
      .select('id')
      .single()

    if (error || !data) return { error: error?.message ?? 'No se pudo crear el evento.' }

    const syncError = await syncEventoOperarios(supabase, data.id, parseOperarioIds(formData.get('operario_ids')))
    if (syncError) return { error: syncError }

    revalidateEventos()
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
  redirect('/dashboard/agenda?saved=1')
}

export async function updateEvento(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const supabase = await requireUser()
    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de evento requerido.' }

    const parsed = parseEventoForm(formData)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

    const { hora_fin, ...rest } = parsed.data
    const { error } = await supabase
      .from('eventos_agenda')
      .update({ ...rest, hora_fin: hora_fin || null, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return { error: error.message }

    const syncError = await syncEventoOperarios(supabase, id, parseOperarioIds(formData.get('operario_ids')))
    if (syncError) return { error: syncError }

    revalidateEventos()
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
  redirect('/dashboard/agenda?saved=1')
}

export async function deleteEvento(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const supabase = await requireUser()
    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de evento requerido.' }

    const { error } = await supabase.from('eventos_agenda').delete().eq('id', id)
    if (error) return { error: error.message }

    revalidateEventos()
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
  redirect('/dashboard/agenda?saved=1')
}

// ─── Catálogos (gruas / empresas_agenda / operarios) ───────────────────────
// Listas simples: alta + activo/inactivo + borrado. Sin edición de campos
// individuales — YAGNI hasta que el cliente pida más (ver plan de Agenda).

async function catalogToggle(table: CatalogTable, formData: FormData): Promise<AgendaState> {
  try {
    const supabase = await requireUser()
    const id = String(formData.get('id') ?? '').trim()
    const activo = formData.get('activo') === 'true'
    const { error } = await supabase.from(table).update({ activo: !activo }).eq('id', id)
    if (error) return { error: error.message }
    revalidateCatalogos()
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
}

async function catalogDelete(table: CatalogTable, formData: FormData): Promise<AgendaState> {
  try {
    const supabase = await requireUser()
    const id = String(formData.get('id') ?? '').trim()
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) return { error: error.message }
    revalidateCatalogos()
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
}

function parseGruaForm(formData: FormData) {
  return gruaSchema.safeParse({
    nombre:              formData.get('nombre'),
    patente:             formData.get('patente'),
    capacidad_toneladas: formData.get('capacidad_toneladas') || undefined,
    tipo:                formData.get('tipo') || undefined,
  })
}

export async function createGrua(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const supabase = await requireUser()
    const parsed = parseGruaForm(formData)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    const { error } = await supabase.from('gruas').insert(parsed.data)
    if (error) return { error: error.message }
    revalidateCatalogos()
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
}
export async function updateGrua(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const supabase = await requireUser()
    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { error: 'ID de grúa requerido.' }
    const parsed = parseGruaForm(formData)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    const { error } = await supabase.from('gruas').update(parsed.data).eq('id', id)
    if (error) return { error: error.message }
    revalidateCatalogos()
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
}
export async function toggleGrua(prevState: unknown, formData: FormData) {
  return catalogToggle('gruas', formData)
}
export async function deleteGrua(prevState: unknown, formData: FormData) {
  return catalogDelete('gruas', formData)
}

export async function createEmpresaAgenda(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const supabase = await requireUser()
    const parsed = empresaAgendaSchema.safeParse({
      nombre:   formData.get('nombre'),
      contacto: formData.get('contacto'),
      telefono: formData.get('telefono'),
      notas:    formData.get('notas'),
    })
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    const { error } = await supabase.from('empresas_agenda').insert(parsed.data)
    if (error) return { error: error.message }
    revalidateCatalogos()
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
}
export async function toggleEmpresaAgenda(prevState: unknown, formData: FormData) {
  return catalogToggle('empresas_agenda', formData)
}
export async function deleteEmpresaAgenda(prevState: unknown, formData: FormData) {
  return catalogDelete('empresas_agenda', formData)
}

export async function createOperario(prevState: unknown, formData: FormData): Promise<AgendaState> {
  try {
    const supabase = await requireUser()
    const parsed = operarioSchema.safeParse({
      nombre:   formData.get('nombre'),
      telefono: formData.get('telefono'),
    })
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
    const { error } = await supabase.from('operarios').insert(parsed.data)
    if (error) return { error: error.message }
    revalidateCatalogos()
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido.' }
  }
}
export async function toggleOperario(prevState: unknown, formData: FormData) {
  return catalogToggle('operarios', formData)
}
export async function deleteOperario(prevState: unknown, formData: FormData) {
  return catalogDelete('operarios', formData)
}
