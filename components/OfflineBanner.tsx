'use client'

import { useSyncExternalStore } from 'react'
import { WifiOff } from 'lucide-react'

function subscribe(onChange: () => void) {
  window.addEventListener('online', onChange)
  window.addEventListener('offline', onChange)
  return () => {
    window.removeEventListener('online', onChange)
    window.removeEventListener('offline', onChange)
  }
}

export default function OfflineBanner() {
  // En el servidor no hay navegador: se asume conectado, y el cliente corrige tras hidratar.
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true)

  if (online) return null

  return (
    <div
      className="fixed top-0 inset-x-0 z-200 bg-zinc-900 text-white text-xs font-bold text-center py-1.5 flex items-center justify-center gap-2"
      style={{ paddingTop: 'calc(0.375rem + env(safe-area-inset-top))' }}
    >
      <WifiOff size={12} /> Sin conexión — mostrando la última información guardada
    </div>
  )
}
