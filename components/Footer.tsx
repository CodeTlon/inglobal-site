
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          
          {/* Brand & Redes Sociales */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <Link href="/" className="inline-block border-none outline-none">
                <Image
                  src="/images/logo.webp"
                  alt="Grúas InGlobal S.R.L."
                  className="h-10 w-auto object-contain"
                  sizes="160px"
                  width={160}
                  height={40}
                />
              </Link>
            </div>
            
            <p className="text-sm leading-relaxed text-slate-400">
              Soluciones de elevación y logística pesada para los desafíos más exigentes del mercado industrial. Más de 40 años de trayectoria en Argentina.
            </p>
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

          {/* Contacto Directo */}
          <div className="space-y-5">
            <h3 className="text-white font-headline font-semibold text-base">Atención Comercial</h3>
            <ul className="space-y-4">

              {/* Link llamadas tradicionales */}
              <li>
                <a
                  href="tel:03513454244"
                  className="flex items-center gap-3 text-sm text-slate-400 hover:text-igb-yellow transition-colors group"
                >
                  <Phone className="w-4 h-4 flex-shrink-0 text-igb-yellow" />
                  0351 345-4244
                </a>
              </li>

              <li className="flex items-start gap-3 text-sm text-slate-400">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-igb-yellow" />
                <span>Ana Riglos de Irigoyen S/N<br />Córdoba, Argentina</span>
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
                <span>Lun-Vie 8-18h / Sáb 8-13h</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 text-center md:text-left">
            © {new Date().getFullYear()} Grúas InGlobal S.R.L. Todos los derechos reservados.
          </p>
          
          <ul className="flex items-center gap-6">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <CodeTlonBadge />
    </footer>
  )
}