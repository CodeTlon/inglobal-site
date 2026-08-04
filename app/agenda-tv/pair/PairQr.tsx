'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

const POLL_MS = 1500

export default function PairQr() {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'pending' | 'error'>('loading')
  // ponytail: el fallo real queda en el log del server (route.ts ya loggea la causa);
  // acá solo mostramos que falló para que no parezca que la página "se recargó sola".
  const [exchangeFailed, setExchangeFailed] = useState(
    () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('error'),
  )
  const tokenRef = useRef<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startPairing = useCallback(async () => {
    setStatus('loading')
    setQrDataUrl(null)
    try {
      const res = await fetch('/api/tv-pair/start', { method: 'POST' })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Error')
      const token: string = body.data.token
      tokenRef.current = token

      const deepLink = `inglobalagendaapp://pair?token=${token}`
      const dataUrl = await QRCode.toDataURL(deepLink, { width: 320, margin: 1, color: { dark: '#191c1d', light: '#ffffff' } })
      setQrDataUrl(dataUrl)
      setStatus('pending')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    startPairing()
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [startPairing])

  useEffect(() => {
    if (status !== 'pending') return

    pollRef.current = setInterval(async () => {
      const token = tokenRef.current
      if (!token) return
      try {
        const res = await fetch(`/api/tv-pair/status?token=${token}`)
        const body = await res.json()
        const s = body?.data?.status
        if (s === 'approved') {
          if (pollRef.current) clearInterval(pollRef.current)
          window.location.href = `/api/tv-pair/exchange?token=${token}`
        } else if (s === 'expired') {
          if (pollRef.current) clearInterval(pollRef.current)
          startPairing()
        }
      } catch {
        // sigue intentando en el próximo tick
      }
    }, POLL_MS)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [status, startPairing])

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="bg-white rounded-2xl p-6 w-[352px] h-[352px] flex items-center justify-center">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="Código QR para vincular la app" width={320} height={320} />
        ) : (
          <span className="text-slate-500">{status === 'error' ? 'No se pudo generar el código.' : 'Generando código…'}</span>
        )}
      </div>
      <p className="text-slate-300 text-center max-w-sm">
        Abrí la app InGlobal Agenda en tu celular, tocá &quot;Vincular TV&quot; y escaneá este código.
      </p>
      {exchangeFailed && (
        <p className="text-red-400 text-center max-w-sm">
          La vinculación falló al confirmar la sesión. Probá de nuevo con el código nuevo — si sigue fallando, hay más detalle en el log del servidor.
        </p>
      )}
    </div>
  )
}
