// Dominio canónico. En preview de Vercel (VERCEL_ENV !== 'production') usa la URL
// real del deployment (VERCEL_URL, la inyecta Vercel solo) — evita que og:image
// apunte a gruasinglobal.com (el sitio viejo, todavia no es este build) mientras
// no se hizo el cutover de dominio. Sin headers()/cookies(): sigue siendo estatico
// en build time, no tira la ruta a render dinamico.
const previewUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_ENV === 'production' ? 'https://gruasinglobal.com' : previewUrl) ??
  'https://gruasinglobal.com'
