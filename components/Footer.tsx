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
  const [settings, extra, navbarSettings, contactoHeader] = await Promise.all([
    getSiteSettings('footer'),
    getSiteSettings('footer_extra'),
    getSiteSettings('navbar'),
    getSiteSettings('contacto_header'),
  ])

  const description =
    (settings.description as string) ||
    'Soluciones de elevación y logística pesada para los desafíos más exigentes del mercado industrial. Más de 40 años de trayectoria en Argentina.'
  const phone = (settings.phone as string) || '0351 345-4244'
  const phoneSecondary = settings.phone_secondary as string | undefined
  const address = (settings.address as string) || 'Ana Riglos de Irigoyen S/N\nCórdoba, Argentina'
  const email = (settings.email as string) || 'cotizacionesinglobalsrl@gmail.com'
  const hours = (settings.hours as string) || 'Lun-Vie 8-18h / Sáb 8-13h'

  // Mismos 7 links que el Navbar (misma key `navbar`, un solo lugar para editar el texto).
  const navLinks = BASE_NAV_LINKS.map((link) => ({ ...link, label: (navbarSettings[link.id] as string) || link.label }))
  const legalLinks = BASE_LEGAL_LINKS.map((link) => ({ ...link, label: (extra[link.id] as string) || link.label }))
  const navHeading = (extra.nav_heading as string) || 'Navegación'
  const contactHeading = (extra.contact_heading as string) || 'Atención Comercial'
  const copyrightName = (extra.copyright_name as string) || 'Grúas InGlobal S.R.L.'
  const whatsapp = (contactoHeader.whatsapp as string) || 'https://wa.me/5493513454244'
  const instagram = (contactoHeader.instagram as string) || 'https://www.instagram.com/gruasinglobal'

  // phone number for tel: link — strip spaces/dashes
  const phoneHref = `tel:${phone.replace(/[\s-]/g, '')}`
  const phoneSecondaryHref = phoneSecondary ? `tel:${phoneSecondary.replace(/[\s-]/g, '')}` : null
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
            <div className="flex items-center gap-4">
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactar por WhatsApp"
                className="text-slate-400 transition-colors hover:text-igb-yellow hover:scale-110 inline-block transform active:scale-95"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver Instagram de Grúas InGlobal"
                className="text-slate-400 transition-colors hover:text-igb-yellow hover:scale-110 inline-block transform active:scale-95"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
            </div>
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

              {phoneSecondaryHref && (
                <li>
                  <a
                    href={phoneSecondaryHref}
                    className="flex items-center gap-3 text-sm text-slate-400 hover:text-igb-yellow transition-colors group"
                  >
                    <Phone className="w-4 h-4 flex-shrink-0 text-igb-yellow" />
                    {phoneSecondary}
                  </a>
                </li>
              )}

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
