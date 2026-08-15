import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { getSiteSettings } from '@/lib/content'
import { BASE_NAV_LINKS } from '@/lib/nav-links'

const BASE_LEGAL_LINKS = [
  { href: '/aviso-legal', label: 'Aviso Legal', id: 'aviso_legal' },
  { href: '/politica-de-privacidad', label: 'Política de Privacidad', id: 'politica_privacidad' },
]

export default async function Footer() {
  const [settings, extra, navbarSettings] = await Promise.all([
    getSiteSettings('footer'),
    getSiteSettings('footer_extra'),
    getSiteSettings('navbar'),
  ])

  const description =
    (settings.description as string) ||
    'Soluciones de elevación y logística pesada para los desafíos más exigentes del mercado industrial. Más de 40 años de trayectoria en Argentina.'
  const phone = (settings.phone as string) || '0351 345-4244'
  const address = (settings.address as string) || 'Ana Riglos de Irigoyen S/N\nCórdoba, Argentina'
  const email = (settings.email as string) || 'info@gruasinglobal.com'
  const hours = (settings.hours as string) || 'Lun-Vie 8-18h / Sáb 8-13h'

  // Mismos 7 links que el Navbar (misma key `navbar`, un solo lugar para editar el texto).
  const navLinks = BASE_NAV_LINKS.map((link) => ({ ...link, label: (navbarSettings[link.id] as string) || link.label }))
  const legalLinks = BASE_LEGAL_LINKS.map((link) => ({ ...link, label: (extra[link.id] as string) || link.label }))
  const navHeading = (extra.nav_heading as string) || 'Navegación'
  const contactHeading = (extra.contact_heading as string) || 'Atención Comercial'
  const copyrightName = (extra.copyright_name as string) || 'Grúas InGlobal S.R.L.'

  // phone number for tel: link — strip spaces/dashes
  const phoneHref = `tel:${phone.replace(/[\s-]/g, '')}`
  // address for display — support \n in DB value
  const addressLines = address.split('\n')

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container-igb pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">

          {/* Brand */}
          <div className="lg:col-span-1 space-y-6">
            <Link href="/" className="inline-block border-none outline-none">
              <Image
                src="/images/logo.png"
                alt="Grúas InGlobal S.R.L."
                className="h-14 w-auto object-contain"
                sizes="240px"
                width={240}
                height={70}
              />
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">{description}</p>
          </div>

          {/* Nav */}
          <div className="space-y-5">
            <h3 className="text-white font-headline font-semibold text-base">{navHeading}</h3>
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
            <h3 className="text-white font-headline font-semibold text-base">{contactHeading}</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href={phoneHref}
                  className="flex items-center gap-3 text-sm text-slate-400 hover:text-igb-yellow transition-colors group"
                >
                  <Phone className="w-4 h-4 flex-shrink-0 text-igb-yellow" />
                  {phone}
                </a>
              </li>

              <li className="flex items-start gap-3 text-sm text-slate-400">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-igb-yellow" />
                <span>
                  {addressLines.map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < addressLines.length - 1 && <br />}
                    </span>
                  ))}
                </span>
              </li>

              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 text-sm text-slate-400 hover:text-igb-yellow transition-colors"
                >
                  <Mail className="w-4 h-4 flex-shrink-0 text-igb-yellow" />
                  {email}
                </a>
              </li>

              <li className="flex items-start gap-3 text-sm text-slate-400">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-igb-yellow" />
                <span>{hours}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500 text-center md:text-left">
            © {new Date().getFullYear()} {copyrightName} — Todos los derechos reservados.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <ul className="flex items-center gap-6">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <span className="hidden sm:inline-block w-px h-3 bg-slate-700" aria-hidden="true" />

            <a
              href="https://codetlon.com.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="group text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Diseño y Desarrollo por{' '}
              <span className="font-medium text-slate-400 group-hover:text-white transition-colors">
                CodeTlon
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
