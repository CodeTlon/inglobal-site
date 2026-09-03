'use client'

import { useState } from 'react'
import { Share2, Check, Link2 } from 'lucide-react'

interface ShareButtonProps {
  title: string
  text?: string
  /** Si no se pasa, usa window.location.href en el click (evita mismatch de SSR). */
  url?: string
  className?: string
}

/** Web Share API (mobile/algunos desktop) con fallback a copiar el link al portapapeles. */
export default function ShareButton({ title, text, url, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const shareUrl = url ?? window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl })
        return
      } catch {
        // Usuario canceló el share nativo — no hacer fallback en ese caso.
        return
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard no disponible — sin fallback ulterior, el link sigue visible en la barra */
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={
        className ??
        'inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-5 py-3 text-sm font-bold text-zinc-700 transition-colors hover:border-igb-yellow/40 hover:text-igb-yellow-dark active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-igb-yellow'
      }
      aria-label="Compartir"
    >
      {copied ? (
        <>
          <Check size={16} className="text-green-600" /> Link copiado
        </>
      ) : (
        <>
          {typeof navigator !== 'undefined' && 'share' in navigator ? (
            <Share2 size={16} />
          ) : (
            <Link2 size={16} />
          )}{' '}
          Compartir
        </>
      )}
    </button>
  )
}
