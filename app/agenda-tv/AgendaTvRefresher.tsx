'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Refresca la página cada `intervalMs` (default 60s) — la TV nunca se toca a mano. */
export default function AgendaTvRefresher({ intervalMs = 60000 }: { intervalMs?: number }) {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs)
    return () => clearInterval(id)
  }, [router, intervalMs])

  return null
}
