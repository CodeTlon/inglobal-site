const PATTERNS = [
  /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/i,
  /(?:youtu\.be\/)([\w-]{11})/i,
  /(?:youtube\.com\/embed\/)([\w-]{11})/i,
  /(?:youtube\.com\/shorts\/)([\w-]{11})/i,
  /(?:youtube\.com\/v\/)([\w-]{11})/i,
]

export function parseYoutubeId(url: string | null | undefined): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null
  for (const re of PATTERNS) {
    const m = trimmed.match(re)
    if (m?.[1]) return m[1]
  }
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed
  return null
}

export function youtubeEmbedUrl(url: string | null | undefined): string | null {
  const id = parseYoutubeId(url)
  return id ? `https://www.youtube.com/embed/${id}` : null
}
