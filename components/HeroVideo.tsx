'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Picture from '@/components/Picture'

interface HeroVideoProps {
  /** URL del video MP4 para md+ (desktop/tablet). Si es undefined/null, cae al fallback. */
  videoUrl?: string | null
  /** URL del video MP4 para <md (mobile). Si no hay, usa videoUrl también en mobile. */
  mobileVideoUrl?: string | null
  /** Focal point del video, `"X% Y%"` — se aplica como object-position. `null`/undefined = centro. */
  videoFocal?: string | null
  /**
   * Imagen de fallback. Acepta:
   * - Basename de Picture: "igb-3"
   * - Ruta local: "/images/igb-3.webp"
   * - URL remota: "https://xxx.supabase.co/..."
   */
  fallbackImageSrc: string
  fallbackImageAlt: string
  /** CSS className que se aplica tanto al video como a la imagen fallback. */
  className?: string
  sizes?: string
}

/**
 * HeroVideo — capa de fondo del hero.
 * - Elige videoUrl o mobileVideoUrl según breakpoint y hace <video autoPlay muted loop playsInline>.
 * - Respeta prefers-reduced-motion: si es true, nunca hace autoplay.
 * - Si no hay video para ese breakpoint (o motion reducida), muestra la imagen de fallback.
 * - El fallback usa <Picture> para URLs locales/basenames y <Image> para URLs remotas.
 */
export default function HeroVideo({
  videoUrl,
  mobileVideoUrl,
  videoFocal,
  fallbackImageSrc,
  fallbackImageAlt,
  className = 'object-cover object-[70%_center] md:object-center',
  sizes = '100vw',
}: HeroVideoProps) {
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const url = isMobile ? mobileVideoUrl || videoUrl : videoUrl || mobileVideoUrl
    if (url) setActiveVideoUrl(url)
    // ponytail: chequeo una sola vez al montar, no reacciona a un resize/rotate en vivo — asumible para un hero que no cambia de breakpoint mientras se está viendo.
  }, [videoUrl, mobileVideoUrl])

  const isRemote = fallbackImageSrc.startsWith('http')
  // ponytail: convención de optimize-video.mjs (<name>.mp4 + <name>-poster.jpg). Solo aplica
  // a videos locales pre-generados (/videos/opt/...) — un video subido por Storage no tiene poster
  // y cae a undefined (mismo comportamiento de antes, sin 404 nuevo).
  const videoPoster = activeVideoUrl?.startsWith('/videos/')
    ? activeVideoUrl.replace(/\.mp4$/, '-poster.jpg')
    : isRemote
      ? fallbackImageSrc
      : undefined

  return (
    <>
      {activeVideoUrl && (
        <video
          key={activeVideoUrl}
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster={videoPoster}
          className={`absolute inset-0 w-full h-full ${className}`}
          style={videoFocal ? { objectPosition: videoFocal } : undefined}
        >
          <source src={activeVideoUrl} type="video/mp4" />
        </video>
      )}

      {/* Fallback image — always rendered, hidden behind video via z-index */}
      {!activeVideoUrl && (
        isRemote ? (
          <Image
            src={fallbackImageSrc}
            alt={fallbackImageAlt}
            fill
            priority
            sizes={sizes}
            className={className}
          />
        ) : (
          <Picture
            src={fallbackImageSrc}
            alt={fallbackImageAlt}
            fill
            priority
            sizes={sizes}
            className={`hero-bg-zoom ${className}`}
          />
        )
      )}
    </>
  )
}
