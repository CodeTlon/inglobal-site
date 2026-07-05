import Link from 'next/link'
import { getMontajes, getClientes, getServicios } from '@/lib/content'
import { Building2, Users, Wrench, ArrowRight } from 'lucide-react'

export default async function DashboardHomePage() {
  const [montajes, clientes, servicios] = await Promise.all([
    getMontajes({ includeUnpublished: true }),
    getClientes({ includeUnpublished: true }),
    getServicios({ includeUnpublished: true }),
  ])

  const stats = [
    {
      label: 'Servicios',
      count: servicios.length,
      href: '/dashboard/servicios',
      icon: Wrench,
      color: 'bg-blue-50 text-blue-600',
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
      color: 'bg-green-50 text-green-600',
    },
  ]

  const quickLinks = [
    { href: '/dashboard/contenido/hero', label: 'Editar Hero' },
    { href: '/dashboard/contenido/footer', label: 'Editar Footer' },
    { href: '/dashboard/contenido/stats', label: 'Editar Stats' },
    { href: '/dashboard/montajes/nuevo', label: 'Nuevo Montaje' },
    { href: '/dashboard/clientes/nuevo', label: 'Nuevo Cliente' },
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
        <h2 className="text-base font-headline font-bold text-zinc-900 mb-4">
          Accesos rápidos
        </h2>
        <div className="flex flex-wrap gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-2 bg-zinc-50 hover:bg-igb-yellow/10 text-zinc-700 hover:text-igb-yellow-dark border border-zinc-200 hover:border-igb-yellow/40 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
