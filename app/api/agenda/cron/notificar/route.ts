import { db } from '@/lib/db'
import { apiData, apiError } from '@/lib/api-auth'
import { friendlyError } from '@/lib/friendly-error'
import { borrarTokens, enviarPush, getTokensPush, reclamarClave, type MensajePush } from '@/lib/push'
import {
  ahoraEnCordoba,
  armarAvisoReserva,
  armarResumenManana,
  diaSiguiente,
  esHoraDeRecordatorio,
  reservaPorVencer,
  type EventoParaAviso,
} from '@/lib/notificaciones'

export const dynamic = 'force-dynamic'

type EventoRow = EventoParaAviso & { id: string; fecha: string }

const SELECT = 'id, fecha, hora_inicio, grua:gruas(nombre), eventos_gruas(orden, grua:gruas(nombre)), empresa:empresas_agenda(nombre)'

/**
 * Cron (ver .github/workflows/cron-notificar.yml, cada 15 min) — manda dos avisos
 * push a todos los dispositivos registrados:
 *  - Recordatorio: una vez por día, desde las 19:00 (Córdoba), con los servicios de mañana.
 *  - Reserva por vencer: una vez por reserva, cuando falta menos de 2 h para su hora de
 *    inicio (a esa hora se auto-cancela, ver estadoTransicionado en lib/agenda-business.ts).
 *
 * Idempotente: cada aviso reclama una clave en `notificaciones_enviadas` antes de enviar,
 * así que correr el endpoint varias veces no duplica. Protegido con CRON_SECRET, igual
 * que /api/agenda/cron/transicionar-estados.
 */
export async function GET(request: Request) {
  try {
    const auth = request.headers.get('authorization')
    if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return apiError('No autorizado.', 401)
    }

    const admin = db
    const now = new Date()
    const hoy = ahoraEnCordoba(now).fecha
    const manana = diaSiguiente(hoy)

    const tokens = await getTokensPush(admin)
    if (tokens.length === 0) return apiData({ tokens: 0, recordatorio: false, reservas: 0 })

    const mensajes: MensajePush[] = []
    const paraTodos = (title: string, body: string, data: Record<string, string>) =>
      tokens.forEach((to) => mensajes.push({ to, title, body, data }))

    // Recordatorio del día siguiente
    let recordatorio = false
    if (esHoraDeRecordatorio(now)) {
      const { data, error } = await admin
        .from('eventos_agenda')
        .select(SELECT)
        .eq('fecha', manana)
        .in('estado', ['reserva', 'programado'])
        .order('hora_inicio', { ascending: true })
      if (error) return apiError(friendlyError(error), 500)

      const resumen = armarResumenManana((data ?? []) as unknown as EventoRow[])
      if (resumen && (await reclamarClave(admin, `recordatorio:${manana}`))) {
        paraTodos(resumen.title, resumen.body, { tipo: 'recordatorio', fecha: manana })
        recordatorio = true
      }
    }

    // Reservas por vencer (hoy y mañana: la ventana de 2 h puede cruzar medianoche)
    let reservas = 0
    const { data: pendientes, error: errReservas } = await admin
      .from('eventos_agenda')
      .select(SELECT)
      .eq('estado', 'reserva')
      .in('fecha', [hoy, manana])
    if (errReservas) return apiError(friendlyError(errReservas), 500)

    for (const ev of (pendientes ?? []) as unknown as EventoRow[]) {
      if (!reservaPorVencer(ev.fecha, ev.hora_inicio, now)) continue
      if (!(await reclamarClave(admin, `reserva:${ev.id}`))) continue
      const aviso = armarAvisoReserva(ev)
      paraTodos(aviso.title, aviso.body, { tipo: 'reserva', eventoId: ev.id, fecha: ev.fecha })
      reservas++
    }

    const { enviados, tokensInvalidos } = await enviarPush(mensajes)
    await borrarTokens(admin, tokensInvalidos)

    return apiData({ tokens: tokens.length, recordatorio, reservas, enviados, tokensInvalidos: tokensInvalidos.length })
  } catch (e) {
    return apiError(friendlyError(e), 500)
  }
}
