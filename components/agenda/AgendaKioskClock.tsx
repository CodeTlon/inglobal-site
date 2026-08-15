'use client'

import { useEffect, useState } from 'react'

/**
 * Fecha/hora en vivo del header de agenda-tv — client-only a propósito: antes se
 * calculaba `new Date()` directo en el Server Component y podía terminar mostrando
 * un texto server-renderizado distinto del que el cliente reconciliaba (TZ del
 * server vs. del navegador, o un payload prefetcheado viejo), lo que disparaba
 * "Hydration failed" (React #418). Arrancando en `null` y recién completando el
 * valor después del mount, el server nunca emite un texto que el cliente pueda
 * contradecir. De paso tickea solo cada 30s en vez de quedar congelada hasta el
 * próximo hard-reload de la TV.
 */
export default function AgendaKioskClock({ isLight }: { isLight: boolean }) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  if (!now) return null

  return (
    <span className={`text-xs sm:text-sm text-right whitespace-nowrap ${isLight ? 'text-zinc-400' : 'text-slate-400'}`}>
      <span className="hidden sm:inline">
        {now.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
        {' · '}
      </span>
      {now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
    </span>
  )
}
