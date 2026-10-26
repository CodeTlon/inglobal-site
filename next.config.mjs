/** @type {import('next').NextConfig} */
// Origen público de los archivos (bucket S3-compatible: MinIO/R2). Ver lib/storage.ts.
const storageUrl = process.env.STORAGE_PUBLIC_URL ? new URL(process.env.STORAGE_PUBLIC_URL) : null
const storageOrigin = storageUrl ? storageUrl.origin : ''

// Solo `next dev`: Next bloquea los recursos de desarrollo (y con ellos la hidratación de React) si se abre desde
// un host distinto de localhost, p. ej. la IP de Tailscale de la VPS. Se habilita con DEV_ALLOWED_ORIGINS=ip1,host2.
const devOrigins = (process.env.DEV_ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim()).filter(Boolean)

const nextConfig = {
  output: 'standalone',
  ...(devOrigins.length ? { allowedDevOrigins: devOrigins } : {}),
  // `next dev` escribe solo un bloque <!-- BEGIN:nextjs-agent-rules --> al final
  // de AGENTS.md cada vez que detecta un agente, así que el archivo aparecía
  // modificado en el working tree sin que nadie lo tocara. Acá el contexto para
  // agentes es nuestro (AGENTS.md + .ai/context/), no el genérico de Next.
  // Desde 16.4 poner esto en false además BORRA el bloque ya escrito en el
  // próximo `next dev`, respetando el resto del archivo.
  agentRules: false,
  experimental: {
    // Server Actions default a 1MB de body — uploadMediaAction acepta imágenes
    // hasta 12MB y videos hasta 20MB (ver app/actions/settings.ts), así que sin
    // esto cualquier archivo real superaba el límite y la subida quedaba
    // colgada (ver Field.tsx: el catch alrededor de uploadMediaAction).
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 75, 85],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 60,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      ...(storageUrl
        ? [{ protocol: storageUrl.protocol.replace(':', ''), hostname: storageUrl.hostname, ...(storageUrl.port ? { port: storageUrl.port } : {}), pathname: `${storageUrl.pathname.replace(/\/$/, '')}/**` }]
        : []),
    ],
  },
  async redirects() {
    return [
      { source: '/index.php', destination: '/', permanent: true },
      { source: '/servicios.php', destination: '/servicios', permanent: true },
      { source: '/montajes.php', destination: '/montajes', permanent: true },
      { source: '/galeria.php', destination: '/galeria', permanent: true },
      { source: '/clientes.php', destination: '/clientes', permanent: true },
      { source: '/contacto.php', destination: '/contacto', permanent: true },
      { source: '/aviso-legal.php', destination: '/aviso-legal', permanent: true },
    ]
  },
  async headers() {
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com`,
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob:${storageOrigin ? ' ' + storageOrigin : ''} https://images.unsplash.com https://i.ytimg.com https://www.googletagmanager.com https://www.google-analytics.com`,
      "font-src 'self' data:",
      `connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com`,
      `media-src 'self'${storageOrigin ? ' ' + storageOrigin : ''}`,
      "frame-src 'self' https://www.google.com https://www.youtube.com https://www.youtube-nocookie.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      'upgrade-insecure-requests',
    ].join('; ')

    const securityHeaders = [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    ]

    // CSP solo en producción: `next dev` usa eval() para Fast Refresh/HMR (webpack
    // eval-source-map) y un websocket propio — un script-src sin 'unsafe-eval' y sin el
    // origen ws: rompería el dev server. En prod (build real, sin webpack HMR) no hace falta.
    if (process.env.NODE_ENV === 'production') {
      securityHeaders.push({ key: 'Content-Security-Policy', value: csp })
    }

    return [
      {
        // Aplica a todo el sitio (público + /dashboard). El deploy es siempre detrás de TLS
        // (Coolify/Traefik; Vercel en `main` hasta el corte), por eso HSTS es seguro sin chequeo condicional.
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig;
