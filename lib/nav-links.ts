// Compartido entre Navbar (client) y Footer (server) — las rutas quedan fijas
// en código, el texto de cada label se edita desde el dashboard (key `navbar`,
// un campo por `id` en este mismo orden). Vive en su propio módulo en vez de
// exportarse desde Navbar.tsx porque un Server Component (Footer) importando
// una constante desde un archivo 'use client' rompe el build de Next
// ("BASE_NAV_LINKS.map is not a function" al prerenderizar).
export const BASE_NAV_LINKS = [
  { href: '/', label: 'Inicio', id: 'index' },
  { href: '/quienes-somos', label: 'Quiénes Somos', id: 'quienes-somos' },
  { href: '/servicios', label: 'Servicios', id: 'servicios' },
  { href: '/montajes', label: 'Montajes', id: 'montajes' },
  { href: '/galeria', label: 'Galería', id: 'galeria' },
  { href: '/clientes', label: 'Clientes', id: 'clientes' },
  { href: '/contacto', label: 'Contacto', id: 'contacto' },
]
