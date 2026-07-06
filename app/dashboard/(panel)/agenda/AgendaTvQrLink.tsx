'use client'

import { useEffect, useState } from 'react'

/**
 * QR con la URL absoluta de /agenda-tv — solo para no tener que tipear la URL
 * en el navegador de la tele al configurarla. No reemplaza el login: la TV
 * igual hace login una vez con Supabase Auth y la sesión queda persistida.
 */
export default function AgendaTvQrLink() {
  const [url, setUrl] = useState('')

  useEffect(() => {
    setUrl(`${window.location.origin}/agenda-tv`)
  }, [])

  if (!url) return null

  return (
    <div className="flex items-center gap-4 bg-white rounded-xl p-4 border border-zinc-200 shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(url)}`}
        alt="QR para abrir la Agenda en la TV"
        width={100}
        height={100}
        className="rounded flex-shrink-0"
      />
      <div className="min-w-0">
        <p className="text-sm font-headline font-bold text-zinc-900">Agenda en TV</p>
        <p className="text-xs text-zinc-400 mt-1">
          Escaneá con el celu para conseguir la URL y abrirla en el navegador de la tele.
          Login único con Supabase Auth — después la sesión queda guardada.
        </p>
        <p className="text-xs text-zinc-500 mt-1 break-all">{url}</p>
      </div>
    </div>
  )
}
