'use client'

import { useEffect } from 'react'

/**
 * Recarga la página cada `intervalMs` (default 60s) — la TV nunca se toca a mano.
 * Reload completo (no router.refresh()): así, además de traer eventos nuevos, la TV
 * también baja CSS/JS del último deploy sola. Con solo refrescar datos, una pestaña
 * que quedó abierta de antes de un deploy se queda para siempre con el bundle viejo.
 */
export default function AgendaTvRefresher({ intervalMs = 60000 }: { intervalMs?: number }) {
  useEffect(() => {
    const id = setInterval(() => window.location.reload(), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return null
}
