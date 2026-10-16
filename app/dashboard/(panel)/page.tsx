import Link from 'next/link'
import { getMontajes, getClientes, getServicios, getSiteSettings } from '@/lib/content'
import { QUICKLINK_CANDIDATES } from '@/lib/constants'
import { getEventosAgenda } from '@/lib/agenda'
import { getEstadoVisual, hoyArgentina } from '@/lib/agenda-view'
import { Building2, Users, Wrench, ArrowRight, CalendarDays, Activity, Clock } from 'lucide-react'
import AccesosRapidosEditor from '@/components/dashboard/AccesosRapidosEditor'

export default async function DashboardHomePage() {
  const hoy = hoyArgentina()
  const [montajes, clientes, servicios, quicklinksSettings, eventosHoy] = await Promise.all([
    getMontajes({ includeUnpublished: true }),
    getClientes({ includeUnpublished: true }),
    getServicios({ includeUnpublished: true }),
    getSiteSettings('dashboard_quicklinks'),
    getEventosAgenda({ desde: hoy, hasta: hoy }),
  ])

  const visuales = eventosHoy.map((e) => getEstadoVisual(e))
  const agendaHoy = [
    { label: 'Servicios hoy', count: visuales.filter((v) => v !== 'cancelado').length, icon: CalendarDays },
    { label: 'En curso', count: visuales.filter((v) => v === 'en_curso').length, icon: Activity },
    { label: 'Pendientes', count: visuales.filter((v) => v === 'reserva' || v === 'programado').length, icon: Clock },
  ]

  // Compat: versiones previas guardaban {href,label}[] en vez de href[].
  const rawItems: unknown[] = Array.isArray(quicklinksSettings.items) ? quicklinksSettings.items : []
  const quickLinks = rawItems
    .map((it) => (typeof it === 'string' ? it : (it as { href: string }).href))
    .map((href) => QUICKLINK_CANDIDATES.find((c) => c.href === href))
    .filter((c): c is { href: string; label: string } => !!c)

  const stats = [
    {
      label: 'Servicios',
      count: servicios.length,
      href: '/dashboard/servicios',
      icon: Wrench,
      color: 'bg-igb-navy/10 text-igb-navy',
    },
    {
      label: 'Montajes',
      count: montajes.length,
      href: '/dashboard/montajes',
      icon: Building2,
      color: 'bg-igb-yellow/10 text-igb-yellow-dark',
    },
    {
      label: 'Clientes',
      count: clientes.length,
      href: '/dashboard/clientes',
      icon: Users,
      color: 'bg-sky-50 text-sky-600',
    },
  ]

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-headline font-bold text-zinc-900 tracking-tight">
          Bienvenido al panel
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Administrá el contenido del sitio de Grúas InGlobal S.R.L.
        </p>
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-xl p-6 border border-zinc-200 shadow-xs hover:shadow-igb hover:-translate-y-0.5 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon size={20} />
              </div>
              <ArrowRight
                size={16}
                className="text-zinc-300 group-hover:text-igb-yellow-dark group-hover:translate-x-1 transition-all"
              />
            </div>
            <p className="text-3xl font-headline font-extrabold text-zinc-900">
              {s.count}
            </p>
            <p className="text-sm text-zinc-500 font-medium mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Agenda de hoy */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-xs mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-headline font-bold text-zinc-900">Agenda de hoy</h2>
          <Link
            href="/dashboard/agenda/calendario"
            prefetch={false}
            className="text-sm font-bold text-igb-yellow-dark hover:underline"
          >
            Ver calendario
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {agendaHoy.map((k) => (
            <div key={k.label} className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3">
              <k.icon size={18} className="text-zinc-400" />
              <div>
                <p className="text-2xl font-headline font-extrabold text-zinc-900 leading-none">{k.count}</p>
                <p className="text-xs text-zinc-500 font-medium mt-1">{k.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-headline font-bold text-zinc-900">
            Accesos rápidos
          </h2>
          <AccesosRapidosEditor settings={quicklinksSettings} />
        </div>
        {quickLinks.length === 0 ? (
          <p className="text-sm text-zinc-400">
            Sin accesos configurados. Usá &quot;Editar&quot; arriba para agregar uno.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center bg-zinc-50 hover:bg-igb-yellow/10 border border-zinc-200 hover:border-igb-yellow/40 hover:shadow-xs px-4 py-3.5 rounded-lg transition-all group"
              >
                <span className="text-sm font-bold text-zinc-700 group-hover:text-igb-yellow-dark transition-colors">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
