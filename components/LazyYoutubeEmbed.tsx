'use client'
import { useState } from 'react'
import { Play } from 'lucide-react'

/**
 * Carga el iframe de YouTube sólo al hacer clic — mismo criterio que
 * LazyGoogleMap.tsx. El embed de YouTube trae ~3.7MB de JS/CSS propios de
 * entrada (confirmado con un HAR real), aunque el usuario nunca haga play.
 */
export default function LazyYoutubeEmbed({
  embedUrl,
  videoId,
  title,
}: {
  embedUrl: string
  videoId: string
  title: string
}) {
  const [loaded, setLoaded] = useState(false)

  if (loaded) {
    return (
      <iframe
        src={`${embedUrl}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      className="absolute inset-0 w-full h-full group cursor-pointer"
      aria-label={`Reproducir video: ${title}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <span className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
        <span className="w-16 h-16 rounded-full bg-igb-yellow text-igb-on-yellow flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
          <Play size={26} fill="currentColor" className="ml-1" />
        </span>
      </span>
    </button>
  )
}
