import type { Metadata } from 'next'
import { MapPin, Phone, Mail, Clock, CreditCard } from 'lucide-react'
import ContactFormWrapper from '@/components/ContactFormWrapper'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contactá a Grúas InGlobal S.R.L. en Córdoba. Tel: 0351 345-4244. Email: info@gruasinglobal.com. Solicítá tu presupuesto sin compromiso.',
}

const contactCards = [
  {
    icon: MapPin,
    title: 'Dirección',
    lines: ['Ana Riglos de Irigoyen S/N', 'Córdoba — Argentina'],
    href: 'https://maps.google.com/?q=Grúas+Inglobal+SRL',
  },
  {
    icon: Phone,
    title: 'Teléfono',
    lines: ['0351 345-4244'],
    href: 'tel:03513454244',
  },
  {
    icon: Clock,
    title: 'Horario',
    lines: ['Lun a Vie: 8:00 — 18:00', 'Sáb: 8:00 — 13:00'],
  },
  {
    icon: CreditCard,
    title: 'Medios de Pago',
    lines: ['Efectivo / Transferencia', 'Cheque / Echeq'],
  },
]

export default function ContactoPage() {
  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 bg-igb-surface-low">
        <div className="container-igb">
          <span className="label-tag">¿Hablamos?</span>
          <h1 className="heading-display mb-4">Consultanos sin compromiso</h1>
          <p className="text-body-lg max-w-2xl">
            Estamos para resolver tu necesidad de movimiento y elevación. Contactanos por cualquiera de estos medios.
          </p>
        </div>
      </section>

      {/* Main grid */}
      <section className="section-pad bg-igb-surface">
        <div className="container-igb">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left: contact info */}
            <div>
              {/* Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {contactCards.map(({ icon: Icon, title, lines, href }) => (
                  <div key={title} className="bg-igb-surface-low rounded-xl p-5">
                    <div className="w-9 h-9 bg-igb-yellow/20 rounded-lg flex items-center justify-center mb-3">
                      <Icon className="w-4 h-4 text-igb-yellow-dark" />
                    </div>
                    <h3 className="text-xs font-bold text-igb-secondary uppercase tracking-wider mb-2">
                      {title}
                    </h3>
                    {href ? (
                      <a href={href} className="text-sm text-igb-on-surface hover:text-igb-yellow-dark transition-colors">
                        {lines.map((l, i) => (
                          <span key={i} className="block">{l}</span>
                        ))}
                      </a>
                    ) : (
                      lines.map((l, i) => (
                        <p key={i} className="text-sm text-igb-on-surface">{l}</p>
                      ))
                    )}
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-igb-secondary uppercase tracking-wider mb-4">
                  Contacto directo
                </p>
                <a
                  href="https://wa.me/5403513454244"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#25D366] text-white px-5 py-3 rounded-lg font-bold text-sm hover:brightness-95 transition-all w-full sm:w-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="h-5 w-5 flex-shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="mailto:info@gruasinglobal.com"
                    className="flex items-center gap-2 btn-outline text-sm py-3 px-5"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                  <a
                    href="tel:03513454244"
                    className="flex items-center gap-2 btn-outline text-sm py-3 px-5"
                  >
                    <Phone className="w-4 h-4" />
                    Llamar
                  </a>
                  <a
                    href="https://www.instagram.com/gruasinglobal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 btn-outline text-sm py-3 px-5"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    Instagram
                  </a>
                </div>
              </div>
            </div>

            {/* Right: form */}
            <div className="bg-white rounded-2xl p-8 shadow-igb">
              <h2 className="text-xl font-headline font-bold text-igb-on-surface mb-8">
                Envianos tu consulta
              </h2>
              <ContactFormWrapper />
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="section-pad bg-igb-surface-low">
        <div className="container-igb">
          <div className="rounded-xl overflow-hidden shadow-igb">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5120.735420778664!2d-64.1812979!3d-31.3339384!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9432997e4baee84d%3A0xd4a924978118ee6f!2sGr%C3%BAas%20Inglobal%20SRL!5e1!3m2!1ses!2sar!4v1773003277957!5m2!1ses!2sar"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Grúas InGlobal S.R.L. — Córdoba, Argentina"
            />
          </div>
        </div>
      </section>
    </>
  )
}
