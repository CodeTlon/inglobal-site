'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

// ponytail: sin librería de toasts — los CRUD del panel redirigen a la lista
// en éxito (ver Fase 2/7), así que la única forma de avisar "se guardó" es
// una marca en la URL de destino (?saved=created|updated|deleted) que este
// componente lee una vez y limpia, sin agregar entrada al history.
const MESSAGES: Record<string, string> = {
  created: 'Creado correctamente',
  updated: 'Guardado correctamente',
  deleted: 'Eliminado correctamente',
}

export default function SavedToast() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const saved = searchParams.get('saved')
    if (!saved) return
    setMessage(MESSAGES[saved] ?? 'Guardado correctamente')
    // El router.replace de limpieza va DENTRO del timeout, no antes: si se
    // dispara de entrada, cambia searchParams, re-dispara este mismo efecto
    // (dependencia [searchParams]) y su cleanup cancela este setTimeout antes
    // de que llegue a los 3s — el toast quedaba pegado para siempre.
    const timeout = setTimeout(() => {
      setMessage(null)
      const params = new URLSearchParams(searchParams)
      params.delete('saved')
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    }, 3000)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  if (!message) return null

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-2.5 bg-zinc-900 text-white text-sm font-bold px-4 py-3 rounded-lg shadow-lg animate-[igb-fade-up_0.25s_ease-out]">
      <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
      {message}
    </div>
  )
}
