import Link from 'next/link'
import { getMontajes, getClientes, getServicios, getSiteSettings } from '@/lib/content'
import { QUICKLINK_CANDIDATES } from '@/lib/constants'
import { Building2, Users, Wrench, ArrowRight } from 'lucide-react'

export default async function DashboardHomePage() {
  const [montajes, clientes, servicios, quicklinksSettings] = await Promise.all([
    getMontajes({ includeUnpublished: true }),
    getClientes({ includeUnpublished: true }),
    getServicios({ includeUnpublished: true }),
    getSiteSettings('dashboard_quicklinks'),
  ])

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
            className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm hover:shadow-igb hover:-translate-y-0.5 transition-all group"
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

      {/* Accesos rápidos */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-headline font-bold text-zinc-900">
            Accesos rápidos
          </h2>
          <Link
            href="/dashboard/contenido/inicio"
            className="text-xs font-bold text-igb-yellow-dark hover:text-igb-on-surface transition-colors"
          >
            Editar
          </Link>
        </div>
        {quickLinks.length === 0 ? (
          <p className="text-sm text-zinc-400">
            Sin accesos configurados. <Link href="/dashboard/contenido/accesos-rapidos" className="underline">Agregá uno</Link>.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center bg-zinc-50 hover:bg-igb-yellow/10 border border-zinc-200 hover:border-igb-yellow/40 hover:shadow-sm px-4 py-3.5 rounded-lg transition-all group"
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
