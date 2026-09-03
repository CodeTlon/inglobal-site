import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { estadoTransicionado } from '@/lib/agenda-business'
import { apiData, apiError } from '@/lib/supabase-api'
import { friendlyError } from '@/lib/friendly-error'
import { toDateInput, addDays } from '@/lib/agenda-view'

export const dynamic = 'force-dynamic'

/**
 * Cron de Vercel (ver vercel.json) — cancela reservas vencidas sin confirmar
 * y cierra eventos con la ventana horaria pasada DE VERDAD en la base, sin
 * depender de que alguien abra la agenda. `aplicarTransicionEstado` (en
 * lib/agenda.ts) ya hace esta misma transición, pero solo on-read — si nadie
 * mira ese evento, la fila queda vieja indefinidamente y a nivel de la
 * agenda visual mobile/web/TV se ve corregido igual (estadoVisual lo
 * recalcula al vuelo), pero el recurso puede seguir "reservado" para el
 * EXCLUDE constraint de la DB (024_eventos_agenda_no_overlap.sql), que
 * compara el estado crudo de la columna, no el transicionado.
 *
 * Protegido con CRON_SECRET — Vercel Cron manda automáticamente
 * `Authorization: Bearer $CRON_SECRET` en cada invocación programada
 * (ver vercel.json). Sin esa env var seteada en el proyecto, este endpoint
 * rechaza todo con 401.
 */
export async function GET(request: Request) {
  try {
    const auth = request.headers.get('authorization')
    if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return apiError('No autorizado.', 401)
    }

    const supabase = createSupabaseAdminClient()
    // Ventana acotada — eventos más viejos que esto ya fueron transicionados
    // la primera vez que alguien los leyó (o nunca importaron para ningún
    // chequeo de disponibilidad, que solo mira fechas cercanas a hoy).
    const desde = toDateInput(addDays(new Date(), -2))
    const hasta = toDateInput(addDays(new Date(), 2))

    const { data: eventos, error } = await supabase
      .from('eventos_agenda')
      .select('id, estado, fecha, fecha_hasta, hora_inicio, hora_fin')
      .in('estado', ['reserva', 'programado', 'en_curso'])
      .gte('fecha', desde)
      .lte('fecha', hasta)

    if (error) return apiError(friendlyError(error), 500)

    const now = new Date()
    let actualizados = 0
    for (const ev of eventos ?? []) {
      const nuevo = estadoTransicionado(ev, now)
      if (!nuevo) continue
      // Best-effort, igual criterio que aplicarTransicionEstado: si un
      // update puntual falla no aborta el resto del batch.
      const { error: updateError } = await supabase.from('eventos_agenda').update({ estado: nuevo }).eq('id', ev.id)
      if (!updateError) actualizados++
    }

    return apiData({ revisados: eventos?.length ?? 0, actualizados })
  } catch (e) {
    return apiError(friendlyError(e), 500)
  }
}
