/** @type {import('next').NextConfig} */
// Origen público de los archivos (bucket S3-compatible: MinIO/R2). Ver lib/storage.ts.
const storageUrl = process.env.STORAGE_PUBLIC_URL ? new URL(process.env.STORAGE_PUBLIC_URL) : null
const storageOrigin = storageUrl ? storageUrl.origin : ''

const nextConfig = {
  output: 'standalone',
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
    // El servicio de transcode (services/video-transcode, VPS aparte en Coolify) recibe
    // fetch() directo del navegador (lib/client-upload.ts) cuando está configurado — sin
    // esto en connect-src, la CSP lo bloquearía y el upload de video caería silenciosamente
    // al fallback sin comprimir (falla "soft" por diseño, pero mejor no depender de eso).
    const transcodeUrl = process.env.NEXT_PUBLIC_TRANSCODE_SERVICE_URL
    const transcodeOrigin = transcodeUrl ? new URL(transcodeUrl).origin : ''

    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com`,
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob:${storageOrigin ? ' ' + storageOrigin : ''} https://images.unsplash.com https://i.ytimg.com https://www.googletagmanager.com https://www.google-analytics.com`,
      "font-src 'self' data:",
      `connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com${transcodeOrigin ? ' ' + transcodeOrigin : ''}`,
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
        // Aplica a todo el sitio (público + /dashboard). Deploy es siempre Vercel (HTTPS),
        // por eso HSTS es seguro sin chequeo condicional.
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig;
