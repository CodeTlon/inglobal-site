'use client'

import { useState } from 'react'
import AccesosRapidosForm from '@/app/dashboard/(panel)/contenido/accesos-rapidos/AccesosRapidosForm'

// Edición de "Accesos rápidos" ahí mismo en /dashboard, al lado del propio
// widget — no tiene nada que ver con el contenido de la página de Inicio
// del sitio público, es config del panel en sí.
export default function AccesosRapidosEditor({ settings }: { settings: Record<string, unknown> }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-bold text-igb-yellow-dark hover:text-igb-on-surface transition-colors"
      >
        {open ? 'Cerrar' : 'Editar'}
      </button>
      {open && (
        <div className="mt-4 pt-4 border-t border-zinc-200">
          <AccesosRapidosForm settings={settings} />
        </div>
      )}
    </>
  )
}
