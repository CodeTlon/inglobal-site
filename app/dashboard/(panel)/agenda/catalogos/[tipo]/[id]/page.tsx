import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getServerDb } from '@/lib/session'
import { getEventosAgenda, type EventoAgenda } from '@/lib/agenda'
import { formatEstado, getEstadoVisual, estadoColorClassesLight, hoyArgentina, ocupacionHoy } from '@/lib/agenda-view'
import PageHeader from '@/components/dashboard/PageHeader'

export const dynamic = 'force-dynamic'

const TIPOS = {
  grua: { table: 'gruas', label: 'Grúa', filtro: 'gruaId' },
  empresa: { table: 'empresas_agenda', label: 'Empresa', filtro: 'empresaId' },
  operario: { table: 'operarios', label: 'Operario', filtro: 'operarioId' },
} as const

type Tipo = keyof typeof TIPOS

const STATS: { key: string; label: string }[] = [
  { key: 'finalizado', label: 'Finalizados' },
  { key: 'cancelado', label: 'Cancelados' },
  { key: 'en_curso', label: 'En curso' },
  { key: 'programado', label: 'Programados' },
  { key: 'reserva', label: 'Reservados' },
]

function fechaCorta(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function RecursoDetallePage({ params }: { params: Promise<{ tipo: string; id: string }> }) {
  const { tipo, id } = await params
  if (!(tipo in TIPOS)) notFound()
  const cfg = TIPOS[tipo as Tipo]

  const db = await getServerDb()
  const { data: recurso } = await db.from(cfg.table).select('*').eq('id', id).maybeSingle()
  if (!recurso) notFound()

  const eventos = await getEventosAgenda({ [cfg.filtro]: id })
  const conEstado = eventos.map((e) => ({ evento: e, visual: getEstadoVisual(e) }))
  const conteo = (k: string) => conEstado.filter((x) => x.visual === k).length
  const historial = [...conEstado].sort((a, b) => (a.evento.fecha < b.evento.fecha ? 1 : -1))

  const exOperario = tipo === 'operario' && recurso.eliminado_at
  const inactivo = recurso.activo === false
  const ocupacion = ocupacionHoy(eventos, hoyArgentina(), () => true)

  const estadoRecurso = exOperario
    ? 'Ex operario'
    : inactivo
      ? 'Inactivo'
      : ocupacion.kind === 'ocupado'
        ? `Ocupado — ${ocupacion.detail?.toLowerCase()}`
        : 'Disponible'

  function contraparte(e: EventoAgenda): string {
    if (tipo === 'grua') return [e.empresa?.nombre ?? 'Empresa eliminada', e.operarios.map((o) => o.nombre).join(', ')].filter(Boolean).join(' · ')
    if (tipo === 'empresa') return [e.grua?.nombre ?? 'Grúa eliminada', e.operarios.map((o) => o.nombre).join(', ')].filter(Boolean).join(' · ')
    return [e.grua?.nombre ?? 'Grúa eliminada', e.empresa?.nombre ?? 'Empresa eliminada'].join(' · ')
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link
          href="/dashboard/agenda/catalogos"
          prefetch={false}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={14} /> Volver a Catálogos
        </Link>
      </div>

      <PageHeader title={recurso.nombre} description={`${cfg.label} · ${estadoRecurso}`} />

      <section aria-label="Estadísticas" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div className="bg-white border border-zinc-200 rounded-lg px-4 py-3">
          <p className="text-2xl font-headline font-extrabold text-zinc-900">{eventos.length}</p>
          <p className="text-xs text-zinc-500 font-medium">Total</p>
        </div>
        {STATS.map((s) => (
          <div key={s.key} className="bg-white border border-zinc-200 rounded-lg px-4 py-3">
            <p className="text-2xl font-headline font-extrabold text-zinc-900">{conteo(s.key)}</p>
            <p className="text-xs text-zinc-500 font-medium">{s.label}</p>
          </div>
        ))}
      </section>

      <section className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6" aria-label="Historial de eventos">
        <h2 className="font-headline font-bold text-zinc-900 mb-4">Historial de eventos</h2>
        {historial.length === 0 ? (
          <p className="text-sm text-zinc-400">Sin eventos asociados.</p>
        ) : (
          <ul className="space-y-2">
            {historial.map(({ evento, visual }) => (
              <li key={evento.id}>
                <Link
                  href={`/dashboard/agenda/${evento.id}?from=${encodeURIComponent(`/dashboard/agenda/catalogos/${tipo}/${id}`)}`}
                  prefetch={false}
                  className="flex items-center gap-3 border border-zinc-100 rounded-lg px-3 py-2 hover:border-zinc-300 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-900">
                      {fechaCorta(evento.fecha)}
                      {evento.fecha_hasta && evento.fecha_hasta !== evento.fecha ? ` – ${fechaCorta(evento.fecha_hasta)}` : ''} ·{' '}
                      {evento.hora_inicio.slice(0, 5)}
                      {evento.hora_fin ? ` – ${evento.hora_fin.slice(0, 5)}` : ''}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">{contraparte(evento)}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded flex-shrink-0 ${estadoColorClassesLight(visual)}`}>
                    {formatEstado(visual)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
