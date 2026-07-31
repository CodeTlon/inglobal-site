// Dominio canónico. gruasinglobal.com todavía sirve el sitio viejo (Duda), no
// este build — incluso el deploy de producción de Vercel (rama main, VERCEL_ENV
// === 'production') corre en su alias *.vercel.app hasta que se haga el cutover
// de DNS. VERCEL_URL (la inyecta Vercel solo, en todo deployment) siempre apunta
// al alias que SÍ está sirviendo este build, así que gana por default. El día del
// cutover: setear NEXT_PUBLIC_SITE_URL=https://gruasinglobal.com en el entorno
// Production de Vercel — ese override gana siempre. Sin headers()/cookies(): sigue
// siendo estático en build time, no tira la ruta a render dinámico.
const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? vercelUrl ?? 'https://gruasinglobal.com'
