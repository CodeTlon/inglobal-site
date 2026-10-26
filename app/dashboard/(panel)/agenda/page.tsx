import Link from 'next/link'
import { getEventosAgenda, getGruas, getEmpresasAgenda } from '@/lib/agenda'
import { formatEstado, hoyArgentina, nombresGruas } from '@/lib/agenda-view'
import { agruparPorDia, etiquetaDia, filtrarEventos, hastaDelRango, rangoDias, RANGOS_DIAS } from '@/lib/agenda-lista'
import { ESTADOS_EVENTO } from '@/lib/validations/agenda'
import GruasResumen from '@/components/agenda/GruasResumen'
import PageHeader from '@/components/dashboard/PageHeader'
import AgendaTvQrLink from './AgendaTvQrLink'
import { CalendarDays, ChevronRight, MapPin, Plus, Search, Settings2, Users } from 'lucide-react'

const ESTADO_STYLES: Record<string, string> = {
  reserva: 'bg-igb-navy/15 text-igb-navy',
  programado: 'bg-igb-yellow/15 text-igb-yellow-dark',
  en_curso: 'bg-blue-50 text-blue-600',
  finalizado: 'bg-zinc-100 text-zinc-600',
  cancelado: 'bg-red-50 text-red-700',
}

const FIELD = 'w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus-visible:outline-2 focus-visible:outline-igb-navy'

type SearchParams = Promise<{ dias?: string; estado?: string; grua?: string; empresa?: string; q?: string }>

/** Lista de servicios agrupada por día, con rango acotado (7/14/30/60 días) y filtros en la URL. */
export default async function AgendaDashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const hoy = hoyArgentina()
  const dias = rangoDias(sp.dias)
  const hasta = hastaDelRango(hoy, dias)
  const estado = (ESTADOS_EVENTO as readonly string[]).includes(sp.estado ?? '') ? sp.estado : undefined

  const [todos, gruas, empresas] = await Promise.all([
    getEventosAgenda({ desde: hoy, hasta }),
    getGruas(),
    getEmpresasAgenda(),
  ])
  const eventos = filtrarEventos(todos, { estado, gruaId: sp.grua || undefined, empresaId: sp.empresa || undefined, q: sp.q })
  const grupos = agruparPorDia(eventos, hoy)
  const hayFiltros = Boolean(estado || sp.grua || sp.empresa || sp.q)

  const href = (d: number) => {
    const p = new URLSearchParams()
    if (d !== 14) p.set('dias', String(d))
    for (const k of ['estado', 'grua', 'empresa', 'q'] as const) if (sp[k]) p.set(k, sp[k]!)
    const qs = p.toString()
    return qs ? `/dashboard/agenda?${qs}` : '/dashboard/agenda'
  }

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Agenda de Grúas"
        description={`${eventos.length} ${eventos.length === 1 ? 'servicio' : 'servicios'} en los próximos ${dias} días${hayFiltros ? ' (con filtros)' : ''}.`}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/agenda/calendario"
              className="inline-flex items-center gap-2 bg-white text-zinc-600 border border-zinc-200 px-4 py-2.5 rounded-md font-headline font-bold text-sm hover:border-igb-yellow-dark/40 transition-all"
            >
              <CalendarDays size={16} /> Calendario
            </Link>
            <Link
              href="/dashboard/agenda/catalogos"
              className="inline-flex items-center gap-2 bg-white text-zinc-600 border border-zinc-200 px-4 py-2.5 rounded-md font-headline font-bold text-sm hover:border-igb-yellow-dark/40 transition-all"
            >
              <Settings2 size={16} /> Catálogos
            </Link>
            <Link
              href="/dashboard/agenda/nuevo"
              className="inline-flex items-center gap-2 bg-igb-yellow text-igb-on-yellow px-4 py-2.5 rounded-md font-headline font-bold text-sm hover:brightness-95 transition-all"
            >
              <Plus size={16} /> Nuevo evento
            </Link>
          </div>
        }
      />

      <div className="mb-6 max-w-3xl">
        <AgendaTvQrLink />
      </div>

      <form method="get" action="/dashboard/agenda" className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
        {dias !== 14 && <input type="hidden" name="dias" value={dias} />}
        <label className="relative block">
          <span className="sr-only">Buscar por empresa, grúa o lugar</span>
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input name="q" defaultValue={sp.q ?? ''} placeholder="Buscar empresa, grúa o lugar" className={`${FIELD} pl-9`} />
        </label>
        <label>
          <span className="sr-only">Estado</span>
          <select name="estado" defaultValue={estado ?? ''} className={FIELD}>
            <option value="">Todos los estados</option>
            {ESTADOS_EVENTO.map((e) => (
              <option key={e} value={e}>{formatEstado(e)}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Grúa</span>
          <select name="grua" defaultValue={sp.grua ?? ''} className={FIELD}>
            <option value="">Todas las grúas</option>
            {gruas.map((g) => (
              <option key={g.id} value={g.id}>{g.nombre}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Empresa</span>
          <select name="empresa" defaultValue={sp.empresa ?? ''} className={FIELD}>
            <option value="">Todas las empresas</option>
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <button type="submit" className="rounded-md bg-igb-navy px-4 py-2 text-sm font-bold text-white hover:brightness-110 transition-all">
            Filtrar
          </button>
          {hayFiltros && (
            <Link href={href(dias).split('?')[0]} className="text-sm font-semibold text-zinc-500 hover:text-zinc-800 underline underline-offset-2">
              Limpiar
            </Link>
          )}
        </div>
      </form>

      <nav aria-label="Rango de días" className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-zinc-400">Mostrar</span>
        {RANGOS_DIAS.map((d) => (
          <Link
            key={d}
            href={href(d)}
            aria-current={d === dias ? 'page' : undefined}
            className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
              d === dias ? 'border-igb-navy bg-igb-navy text-white' : 'border-zinc-200 bg-white text-zinc-600 hover:border-igb-navy/40'
            }`}
          >
            {d} días
          </Link>
        ))}
      </nav>

      <div className="space-y-8">
        {grupos.map(({ fecha, eventos: delDia }) => (
          <section key={fecha} aria-labelledby={`dia-${fecha}`}>
            <div className="mb-3 flex items-baseline gap-3 border-b border-zinc-200 pb-2">
              <h2 id={`dia-${fecha}`} className="font-headline text-base font-bold capitalize text-zinc-900">
                {etiquetaDia(fecha, hoy)}
              </h2>
              <span className="text-xs font-bold text-zinc-400">
                {delDia.length} {delDia.length === 1 ? 'servicio' : 'servicios'}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {delDia.map((ev) => (
                <Link
                  key={ev.id}
                  href={`/dashboard/agenda/${ev.id}`}
                  className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-xs transition-all hover:border-igb-yellow/40 hover:shadow-igb"
                >
                  <div className="w-16 shrink-0 text-center">
                    <p className="font-headline text-sm font-bold text-zinc-900">{ev.hora_inicio.slice(0, 5)}</p>
                    {ev.hora_fin && <p className="text-xs text-zinc-400">a {ev.hora_fin.slice(0, 5)}</p>}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate font-headline text-sm font-bold text-zinc-900"
                      title={`${ev.empresa?.nombre ?? 'Empresa'} · ${nombresGruas(ev)}`}
                    >
                      {ev.empresa?.nombre ?? 'Empresa'}
                    </p>
                    <GruasResumen ev={ev} className="text-xs text-zinc-500" />
                    <div className="mt-1 flex items-center gap-4 text-xs text-zinc-400">
                      {ev.fecha_hasta && ev.fecha_hasta !== ev.fecha && (
                        <span className="shrink-0">Hasta el {ev.fecha_hasta.split('-').reverse().slice(0, 2).join('/')}</span>
                      )}
                      {ev.ubicacion && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin size={12} /> {ev.ubicacion}
                        </span>
                      )}
                      {ev.operarios.length > 0 && (
                        <span className="flex shrink-0 items-center gap-1">
                          <Users size={12} /> {ev.operarios.length}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={`shrink-0 rounded-sm px-2 py-1 text-xs font-bold ${ESTADO_STYLES[ev.estado] ?? ESTADO_STYLES.programado}`}>
                    {formatEstado(ev.estado)}
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-zinc-300 transition-all group-hover:translate-x-1 group-hover:text-igb-yellow-dark" />
                </Link>
              ))}
            </div>
          </section>
        ))}

        {grupos.length === 0 && (
          <div className="rounded-xl border border-zinc-200 bg-white py-16 text-center">
            <p className="text-sm text-zinc-400">
              {hayFiltros ? 'Ningún servicio coincide con los filtros.' : `No hay servicios en los próximos ${dias} días.`}
            </p>
            {dias < 60 && (
              <Link href={href(60)} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-igb-yellow-dark hover:underline">
                Ver los próximos 60 días
              </Link>
            )}
          </div>
        )}
      </div>

      {grupos.length > 0 && dias < 60 && (
        <div className="mt-8 text-center">
          <Link href={href(RANGOS_DIAS[RANGOS_DIAS.indexOf(dias as (typeof RANGOS_DIAS)[number]) + 1])} className="text-sm font-bold text-igb-navy underline underline-offset-2">
            Cargar más días
          </Link>
        </div>
      )}
    </div>
  )
}
