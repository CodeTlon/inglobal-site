import Image from 'next/image'
import Link from 'next/link'

/**
 * Topbar minimal para las vistas de solo lectura de Agenda (TV mensual + calendario semanal
 * del dashboard) — sin sidebar ni nav del panel, pensado como "app aparte". Default oscuro
 * (TV, se ve a distancia); `theme="light"` lo usa el calendario semanal de jefes, con el logo
 * a color (/images/logo.webp) en vez del blanco.
 */
export default function AgendaKioskHeader({
  title,
  backHref,
  theme = 'dark',
}: {
  title: string
  backHref?: string
  theme?: 'dark' | 'light'
}) {
  const now = new Date()
  const isLight = theme === 'light'
  return (
    <header
      className={`flex items-center gap-4 px-6 sm:px-10 py-6 border-b ${
        isLight ? 'bg-white border-zinc-200' : 'border-white/10'
      }`}
    >
      <Image
        src={isLight ? '/images/logo.webp' : '/images/logo.png'}
        alt="InGlobal"
        width={140}
        height={44}
        className="h-10 w-auto object-contain"
        sizes="140px"
      />
      <h1 className={`text-2xl font-headline font-bold ml-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>{title}</h1>
      {backHref && (
        <Link
          href={backHref}
          className={`ml-4 text-sm transition-colors ${
            isLight ? 'text-zinc-400 hover:text-zinc-900' : 'text-slate-400 hover:text-white'
          }`}
        >
          ← Volver a Agenda
        </Link>
      )}
      <span className={`ml-auto text-sm text-right whitespace-nowrap ${isLight ? 'text-zinc-400' : 'text-slate-400'}`}>
        {now.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
        {' · '}
        {now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </header>
  )
}
