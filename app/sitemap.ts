import type { MetadataRoute } from 'next'
import { getMontajes, getClientes } from '@/lib/content'
import { SITE_URL as BASE_URL } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    '', '/servicios', '/montajes', '/galeria', '/clientes', '/quienes-somos', '/contacto', '/agenda-tv', '/aviso-legal',
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }))

  // Fichas dinámicas (publicadas). getMontajes/getClientes ya caen a fallback ante error.
  // ponytail: trabajos/[slug]/[trabajo] quedan fuera (N queries por cliente); sumar si esas fichas necesitan rankear.
  const [montajes, clientes] = await Promise.all([getMontajes(), getClientes()])
  const montajeRoutes: MetadataRoute.Sitemap = montajes.map((m) => ({
    url: `${BASE_URL}/montajes/${m.slug}`,
    lastModified: m.updated_at ? new Date(m.updated_at) : undefined,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))
  const clienteRoutes: MetadataRoute.Sitemap = clientes.map((c) => ({
    url: `${BASE_URL}/clientes/${c.slug}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : undefined,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...montajeRoutes, ...clienteRoutes]
}
