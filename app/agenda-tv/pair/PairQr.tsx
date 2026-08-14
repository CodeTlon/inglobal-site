'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

const POLL_MS = 1500
// ponytail: techo duro para el polling — si por lo que sea (blip de red del lado de
// la TV, error intermitente del server) el loop nunca ve 'approved', antes se quedaba
// pegado en el mismo QR para siempre y en silencio (el catch de abajo no avisaba nada).
// A los ~20 intentos fallidos seguidos (30s) reintentamos con un código nuevo en vez
// de confiar en que el usuario note que el QR "murió" y recargue la página a mano.
const MAX_CONSECUTIVE_FAILURES = 20

export default function PairQr() {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'pending' | 'error'>('loading')
  // ponytail: el fallo real queda en el log del server (route.ts ya loggea la causa);
  // acá solo mostramos que falló para que no parezca que la página "se recargó sola".
  // No es estado (nunca cambia en la vida de la página: on-success navega afuera con
  // window.location.href) — computarlo en cada render alcanza, no hace falta useState.
  const exchangeFailed = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('error')
  const tokenRef = useRef<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const failCountRef = useRef(0)

  const startPairing = useCallback(async () => {
    setStatus('loading')
    setQrDataUrl(null)
    failCountRef.current = 0
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
        const s = res.ok ? body?.data?.status : undefined
        if (s === 'approved') {
          if (pollRef.current) clearInterval(pollRef.current)
          window.location.href = `/api/tv-pair/exchange?token=${token}`
          return
        } else if (s === 'expired') {
          if (pollRef.current) clearInterval(pollRef.current)
          startPairing()
          return
        }
        if (s !== 'pending') {
          // Respuesta 200 sin el shape esperado, o no-200 — cuenta como intento fallido.
          console.error('[pair-tv] status inesperado:', res.status, body)
          failCountRef.current += 1
        } else {
          failCountRef.current = 0
        }
      } catch (e) {
        console.error('[pair-tv] poll falló:', e)
        failCountRef.current += 1
      }
      if (failCountRef.current >= MAX_CONSECUTIVE_FAILURES) {
        if (pollRef.current) clearInterval(pollRef.current)
        startPairing()
      }
    }, POLL_MS)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [status, startPairing])

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 w-[352px] h-[352px] flex items-center justify-center">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="Código QR para vincular la app" width={320} height={320} />
        ) : (
          <span className="text-zinc-500">{status === 'error' ? 'No se pudo generar el código.' : 'Generando código…'}</span>
        )}
      </div>
      <p className="text-zinc-500 text-center max-w-sm">
        Abrí la app InGlobal Agenda en tu celular, tocá &quot;Vincular TV&quot; y escaneá este código.
      </p>
      {exchangeFailed && (
        <p className="text-red-500 text-center max-w-sm">
          La vinculación falló al confirmar la sesión. Probá de nuevo con el código nuevo — si sigue fallando, hay más detalle en el log del servidor.
        </p>
      )}
    </div>
  )
}
