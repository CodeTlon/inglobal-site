import type { MetadataRoute } from 'next'
import { getMontajes, getClientes, getTrabajos } from '@/lib/content'
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

  // Trabajos (clientes/[slug]/[trabajo]) — antes excluidos a propósito (N queries por
  // cliente, ver historial). Se suman ahora que hay más contenido real y son fichas de
  // caso de éxito indexables por su cuenta; mismo patrón N+1 que ya paga
  // generateStaticParams de esta misma ruta en build, no es costo nuevo. Si el catálogo
  // de clientes/trabajos crece mucho, reevaluar (ej. cachear getTrabajos por cliente).
  const trabajoRoutesNested = await Promise.all(
    clientes
      .filter((c) => c.tiene_blog)
      .map(async (c) => {
        const trabajos = await getTrabajos(c.id)
        return trabajos.map((t) => ({
          url: `${BASE_URL}/clientes/${c.slug}/${t.slug}`,
          lastModified: t.updated_at ? new Date(t.updated_at) : undefined,
          changeFrequency: 'monthly' as const,
          priority: 0.5,
        }))
      })
  )
  const trabajoRoutes: MetadataRoute.Sitemap = trabajoRoutesNested.flat()

  return [...staticRoutes, ...montajeRoutes, ...clienteRoutes, ...trabajoRoutes]
}
