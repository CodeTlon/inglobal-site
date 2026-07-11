/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 75, 85],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 60,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
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
    return [
      {
        // Aplica a todo el sitio (público + /dashboard). Deploy es siempre Vercel (HTTPS),
        // por eso HSTS es seguro sin chequeo condicional.
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ]
  },
}

export default nextConfig;
