// Dominio canónico (sitemap, OG, canonical, JSON-LD, logo del mail de contacto).
// Desde el 2026-11-13 el sitio vive en https://www.gruasinglobal.com (Coolify); el dominio sin www
// no responde, así que el fallback tiene que ser www. NEXT_PUBLIC_SITE_URL lo pisa (entra en el BUILD,
// build arg del compose). VERCEL_URL queda para los previews de Vercel de las PRs.
const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || vercelUrl || 'https://www.gruasinglobal.com'
