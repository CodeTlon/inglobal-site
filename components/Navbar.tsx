'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Inicio', id: 'index' },
  { href: '/servicios', label: 'Servicios', id: 'servicios' },
  { href: '/montajes', label: 'Montajes', id: 'montajes' },
  { href: '/galeria', label: 'Galería', id: 'galeria' },
  { href: '/clientes', label: 'Clientes', id: 'clientes' },
  { href: '/contacto', label: 'Contacto', id: 'contacto' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled || open
          ? 'bg-white/90 backdrop-blur-md shadow-sm'
          : 'bg-white/80 backdrop-blur-md'
      }`}
    >
      <nav className="container-igb flex items-center justify-between h-16 lg:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
        <Image
          src="/images/logo.webp"
          alt="Grúas InGlobal S.R.L."
          className="h-10 w-auto"
          sizes="160px"
          width={160}
          height={40}
          priority
        />
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={`font-headline font-bold text-sm tracking-tight transition-colors ${
                isActive(link.href)
                  ? 'text-igb-yellow-dark border-b-2 border-igb-yellow pb-0.5'
                  : 'text-igb-on-surface/70 hover:text-igb-on-surface'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA Desktop */}
        <div className="hidden lg:flex items-center gap-3">
        </div>

        {/* Mobile burger */}
        <button
          className="lg:hidden p-2 text-igb-on-surface"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="nav-mobile-menu lg:hidden bg-white/95 backdrop-blur-md border-t border-igb-surface-high">
          <div className="container-igb py-6 flex flex-col gap-4">
            {navLinks.map((link, i) => (
              <Link
                key={link.id}
                href={link.href}
                style={{ animationDelay: `${i * 40}ms` }}
                className={`nav-mobile-menu font-headline font-bold text-base py-1 transition-colors ${
                  isActive(link.href)
                    ? 'text-igb-yellow-dark'
                    : 'text-igb-on-surface/70'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
