'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Picture from '@/components/Picture'

interface HeroVideoProps {
  /** URL del video MP4 del hero. Si es undefined/null, cae al fallback. */
  videoUrl?: string | null
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
  /** Si es true, el video solo se monta/reproduce por debajo de md (767px) — arriba de eso se ve la imagen de fallback. Para videos verticales pensados para mobile. */
  mobileOnly?: boolean
}

/**
 * HeroVideo — capa de fondo del hero.
 * - Si hay videoUrl, muestra <video autoPlay muted loop playsInline>.
 * - Respeta prefers-reduced-motion: si es true, nunca hace autoplay.
 * - Si no hay video (o motion reducida), muestra la imagen de fallback.
 * - El fallback usa <Picture> para URLs locales/basenames y <Image> para URLs remotas.
 */
export default function HeroVideo({
  videoUrl,
  fallbackImageSrc,
  fallbackImageAlt,
  className = 'object-cover object-[70%_center] md:object-center',
  sizes = '100vw',
  mobileOnly = false,
}: HeroVideoProps) {
  const [showVideo, setShowVideo] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoUrl) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = !mobileOnly || window.matchMedia('(max-width: 767px)').matches
    if (!prefersReduced && isMobile) {
      setShowVideo(true)
    }
    // ponytail: chequeo una sola vez al montar, no reacciona a un resize/rotate en vivo — asumible para un hero que no cambia de breakpoint mientras se está viendo.
  }, [videoUrl, mobileOnly])

  const isRemote = fallbackImageSrc.startsWith('http')

  return (
    <>
      {showVideo && videoUrl && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster={isRemote ? fallbackImageSrc : undefined}
          className={`absolute inset-0 w-full h-full ${className}`}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}

      {/* Fallback image — always rendered, hidden behind video via z-index */}
      {!showVideo && (
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
