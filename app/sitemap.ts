import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// ponytail: rutas estáticas a mano. Son 7 y no cambian; un glob del filesystem sería over-engineering.
const ROUTES = ['', '/servicios', '/montajes', '/galeria', '/clientes', '/contacto', '/aviso-legal']

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: path === '' ? 1 : 0.8,
  }))
}
