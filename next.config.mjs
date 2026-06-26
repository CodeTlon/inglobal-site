/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 60,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
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
}

export default nextConfig;
