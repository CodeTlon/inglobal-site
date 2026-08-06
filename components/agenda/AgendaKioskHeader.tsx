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
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 px-4 sm:px-10 py-4 sm:py-6 border-b ${
        isLight ? 'bg-white border-zinc-200' : 'border-white/10'
      }`}
    >
      <Image
        src={isLight ? '/images/logo.webp' : '/images/logo.png'}
        alt="InGlobal"
        width={140}
        height={44}
        className="h-8 sm:h-10 w-auto object-contain"
        sizes="140px"
      />
      <h1 className={`text-lg sm:text-2xl font-headline font-bold sm:ml-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>{title}</h1>
      {backHref && (
        <Link
          href={backHref}
          className={`sm:ml-4 flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
            isLight
              ? 'border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              : 'border-white/20 text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          ← Volver
        </Link>
      )}
      <span className="ml-auto flex items-center gap-3">
        {!isLight && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            En vivo
          </span>
        )}
        <span className={`text-xs sm:text-sm text-right whitespace-nowrap ${isLight ? 'text-zinc-400' : 'text-slate-400'}`}>
          <span className="hidden sm:inline">
            {now.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            {' · '}
          </span>
          {now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </span>
    </header>
  )
}
