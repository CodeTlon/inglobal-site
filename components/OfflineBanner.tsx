'use client'

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export default function OfflineBanner() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    setOnline(navigator.onLine)
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  if (online) return null

  return (
    <div
      className="fixed top-0 inset-x-0 z-[200] bg-zinc-900 text-white text-xs font-bold text-center py-1.5 flex items-center justify-center gap-2"
      style={{ paddingTop: 'calc(0.375rem + env(safe-area-inset-top))' }}
    >
      <WifiOff size={12} /> Sin conexión — mostrando la última información guardada
    </div>
  )
}
