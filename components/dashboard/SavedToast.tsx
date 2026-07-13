'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

// ponytail: sin librería de toasts — los CRUD del panel redirigen a la lista
// en éxito (ver Fase 2/7), así que la única forma de avisar "se guardó" es
// una marca en la URL de destino (?saved=1) que este componente lee una vez
// y limpia, sin agregar entrada al history.
export default function SavedToast() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (searchParams.get('saved') !== '1') return
    setVisible(true)
    const params = new URLSearchParams(searchParams)
    params.delete('saved')
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    const timeout = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  if (!visible) return null

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-2.5 bg-zinc-900 text-white text-sm font-bold px-4 py-3 rounded-lg shadow-lg animate-[igb-fade-up_0.25s_ease-out]">
      <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
      Guardado correctamente
    </div>
  )
}
