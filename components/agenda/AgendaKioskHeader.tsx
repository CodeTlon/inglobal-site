import Image from 'next/image'
import Link from 'next/link'

/**
 * Topbar minimal para las vistas de solo lectura de Agenda (TV mensual + calendario semanal
 * del dashboard) — sin sidebar ni nav del panel, pensado como "app aparte". Logo blanco fijo:
 * ambas vistas son de fondo oscuro (si algún día se agrega una versión clara, ahí sí swapear
 * a /images/logo.webp, el logo a color que ya usa el Navbar público).
 */
export default function AgendaKioskHeader({ title, backHref }: { title: string; backHref?: string }) {
  const now = new Date()
  return (
    <header className="flex items-center gap-4 px-6 sm:px-10 py-6 border-b border-white/10">
      <Image src="/images/logo.png" alt="InGlobal" width={140} height={44} className="h-10 w-auto object-contain" sizes="140px" />
      <h1 className="text-2xl font-headline font-bold text-white ml-2">{title}</h1>
      {backHref && (
        <Link href={backHref} className="ml-4 text-sm text-slate-400 hover:text-white transition-colors">
          ← Volver a Agenda
        </Link>
      )}
      <span className="ml-auto text-sm text-slate-400 text-right whitespace-nowrap">
        {now.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
        {' · '}
        {now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </header>
  )
}
