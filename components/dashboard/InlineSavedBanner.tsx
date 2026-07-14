'use client'

import { useEffect, useState } from 'react'
import { CheckCircle } from 'lucide-react'

/**
 * Banner de éxito para los forms de site_settings (singleton, sin crear/editar/borrar
 * separados). A diferencia de SavedToast (que redirige y limpia ?saved= de la URL), acá el
 * form no redirige — por eso el banner necesita su propio timeout para no quedar fijo en
 * pantalla para siempre. `trigger` es el objeto que devuelve useFormState: una referencia
 * nueva en cada submit, así el efecto se vuelve a disparar aunque `success` sea true las dos veces.
 */
export default function InlineSavedBanner({ trigger }: { trigger: { success?: boolean } | null }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!trigger?.success) return
    setShow(true)
    const t = setTimeout(() => setShow(false), 3000)
    return () => clearTimeout(t)
  }, [trigger])

  if (!show) return null

  return (
    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
      <p className="text-green-700 text-sm font-medium">Cambios guardados correctamente.</p>
    </div>
  )
}
