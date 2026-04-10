import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { CodeTlonBadge } from './CodeTlonBadge'

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/montajes', label: 'Montajes' },
  { href: '/galeria', label: 'Galería' },
  { href: '/clientes', label: 'Clientes' },
  { href: '/contacto', label: 'Contacto' },
]

const legalLinks = [
  { href: '/aviso-legal', label: 'Aviso Legal' },
]

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container-igb pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1 space-y-5">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Grúas InGlobal S.R.L."
                width={44}
                height={44}
                className="h-10 w-auto brightness-0 invert"
                sizes="44px"
              />
              <span className="font-headline font-black text-white text-sm uppercase tracking-tight leading-tight">
                Grúas Inglobal<br />
                <span className="font-medium text-slate-400 text-xs">S.R.L.</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Soluciones de elevación y logística pesada para los desafíos más exigentes del mercado industrial. Más de 40 años de trayectoria en Argentina.
            </p>
            <a
              href="https://www.instagram.com/gruasinglobal"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-igb-yellow transition-colors"
              aria-label="Instagram de Grúas InGlobal"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              @gruasinglobal
            </a>
          </div>

          {/* Nav */}
          <div className="space-y-5">
            <h3 className="text-white font-headline font-semibold text-base">Navegación</h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-igb-yellow transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-5">
            <h3 className="text-white font-headline font-semibold text-base">Contacto</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-igb-yellow" />
                <span>Ana Riglos de Irigoyen S/N<br />Córdoba, Argentina</span>
              </li>
              <li>
                <a
                  href="tel:03513454244"
                  className="flex items-center gap-3 text-sm text-slate-400 hover:text-igb-yellow transition-colors"
                >
                  <Phone className="w-4 h-4 flex-shrink-0 text-igb-yellow" />
                  0351 345-4244
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@gruasinglobal.com"
                  className="flex items-center gap-3 text-sm text-slate-400 hover:text-igb-yellow transition-colors"
                >
                  <Mail className="w-4 h-4 flex-shrink-0 text-igb-yellow" />
                  info@gruasinglobal.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-igb-yellow" />
                <span>Lun a Vie: 8:00 — 18:00<br />Sáb: 8:00 — 13:00</span>
              </li>
            </ul>
          </div>

          {/* Legal + CTA */}
          <div className="space-y-5">
            <h3 className="text-white font-headline font-semibold text-base">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-igb-yellow transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="pt-4">
              <Link
                href="/contacto"
                className="bg-igb-yellow text-igb-on-yellow px-5 py-3 rounded-md font-headline font-bold text-sm hover:brightness-95 transition-all active:scale-95 block text-center"
              >
                Solicitar Presupuesto
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Grúas InGlobal S.R.L. Todos los derechos reservados.
          </p>
          <p className="text-xs text-slate-600 font-headline font-bold uppercase tracking-widest">
            Córdoba, Argentina
          </p>
        </div>
      </div>
      <CodeTlonBadge />
    </footer>
  )
}
