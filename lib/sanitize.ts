import sanitizeHtmlLib from 'sanitize-html'

// Allowlist basado en lo que ContentEditor.tsx (TipTap) puede producir:
// StarterKit (párrafos/negrita/itálica/blockquote/listas/H2) + extension-image +
// extension-link + extension-youtube (iframe) + tiptap-video-extension.ts (video propio).
// Reemplaza el sanitizador regex-based anterior (bypasseable con vectores sin espacio
// antes del atributo, ej. `<svg/onload=...>`, o `<iframe src="javascript:...">`) por un
// parser HTML real (htmlparser2 vía sanitize-html) — allowlist de tags/atributos/schemes
// en vez de intentar denylistear cada vector de XSS a mano.
const ALLOWED_TAGS = [
  'p', 'br', 'hr',
  'strong', 'b', 'em', 'i', 'u', 's',
  'blockquote', 'code', 'pre',
  'h1', 'h2', 'h3', 'h4',
  'ul', 'ol', 'li',
  'a', 'img', 'iframe', 'video', 'source',
]

export function sanitizeHtml(html: string): string {
  if (!html) return ''
  return sanitizeHtmlLib(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder', 'loading', 'title'],
      video: ['src', 'controls', 'playsinline', 'width', 'height'],
      source: ['src', 'type'],
    },
    allowedSchemesByTag: {
      a: ['https', 'http', 'mailto', 'tel'],
      img: ['https', 'http', 'data'],
      video: ['https', 'http'],
      source: ['https', 'http'],
    },
    // Youtube.configure({ nocookie: false }) en ContentEditor.tsx → siempre www.youtube.com.
    allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com'],
    transformTags: {
      a: sanitizeHtmlLib.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }),
    },
    disallowedTagsMode: 'discard',
  })
}
