
import type { Metadata } from 'next'
import { Phone, Mail} from 'lucide-react'
import ContactFormWrapper from '@/components/ContactFormWrapper'
import LazyGoogleMap from '@/components/LazyGoogleMap'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contactá a Grúas InGlobal S.R.L. en Córdoba. Ingeniería aplicada a desafíos de elevación.',
}

export default function ContactoPage() {
  return (
    <main className="bg-white">
      {/* Page Header - Minimalista (Zinc 50) */}
      <section className="pt-40 pb-20 bg-zinc-50 border-b border-zinc-100">
        <div className="container-igb">
          <span className="text-igb-yellow-dark text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
            Contacto Directo
          </span>
          <h1 className="text-5xl md:text-6xl font-headline font-extrabold text-zinc-900 tracking-tight mb-6 leading-tight">
            Hablemos de su <br /> próximo proyecto.
          </h1>
          <p className="text-xl text-zinc-500 max-w-2xl leading-relaxed">
            Asesoramiento técnico especializado para operaciones de alta complejidad.
          </p>
        </div>
      </section>

      {/* Sección Principal de Contacto */}
      <section className="py-24">
        <div className="container-igb">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            
            {/* 1. Columna de Formulario (Primero en mobile) */}
            {/* Agregué padding interno forzado a los hijos (inputs y textarea) con [&_input] y [&_textarea] */}
            <div className="order-1 lg:order-2 lg:col-span-7 bg-zinc-50 rounded-3xl p-8 md:p-12 border border-zinc-100 shadow-sm 
                            [&_input]:px-5 [&_input]:py-3 [&_textarea]:p-5">
              <div className="max-w-md">
                <h2 className="text-3xl font-headline font-bold text-zinc-900 mb-2">Envianos tu consulta</h2>
                <p className="text-zinc-500 mb-10 text-sm">Complete el formulario y un asesor técnico le responderá a la brevedad.</p>
              </div>
              <ContactFormWrapper />
            </div>

            {/* 2. Columna de Información (Segundo en mobile) */}
            <div className="order-2 lg:order-1 lg:col-span-5 space-y-12">
              <div className="space-y-10">
                <div className="group">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-600 mb-2">Nuestra Ubicación</p>
                  <p className="text-xl font-medium text-zinc-900 leading-relaxed">
                    Ana Riglos de Irigoyen S/N<br />Córdoba, Argentina
                  </p>
                </div>

                <div className="group">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-600 mb-2">Horarios de Atención</p>
                  <p className="text-xl font-medium text-zinc-900">
                    Lun-Vie 8:00 — 18:00h<br />Sáb 8:00 — 13:00h
                  </p>
                </div>
              </div>

              {/* Canales de comunicación */}
              <div className="pt-10 border-t border-zinc-100">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-600 mb-8">Canales de comunicación</p>
                <div className="flex items-center gap-10">
                  <a href="https://wa.me/5493513454244" target="_blank" rel="noopener noreferrer" aria-label="Contactar por WhatsApp" className="text-zinc-400 hover:text-igb-yellow-dark transition-colors">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </a>
                  <a href="https://www.instagram.com/gruasinglobal" target="_blank" rel="noopener noreferrer" aria-label="Ver Instagram de Grúas InGlobal" className="text-zinc-400 hover:text-igb-yellow-dark transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" aria-hidden="true">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                    </svg>
                  </a>
                  <a href="mailto:info@gruasinglobal.com" aria-label="Enviar email a Grúas InGlobal" className="text-zinc-400 hover:text-igb-yellow-dark transition-colors">
                    <Mail className="w-7 h-7" aria-hidden="true" />
                  </a>
                  <a href="tel:03513454244" aria-label="Llamar a Grúas InGlobal" className="text-zinc-400 hover:text-igb-yellow-dark transition-colors">
                    <Phone className="w-7 h-7" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Sección del Mapa (Igualada a estilo Contacto) */}
      {/* ===== LOCATION ===== */}
      <section className="section-pad bg-igb-surface" id="ubicacion">
        <div className="container-igb">
          <div className="text-center mb-12">
            <span className="label-tag flex justify-center">Dónde Encontrarnos</span>
            <h2 className="heading-display">Nuestra Ubicación</h2>
            <p className="text-body-lg mt-3 max-w-xl mx-auto">
              Acercate a nuestras oficinas o contactanos para planificar tu próximo movimiento.
            </p>
          </div>

          <div className="rounded-xl overflow-hidden shadow-igb">
            <LazyGoogleMap />
          </div>
        </div>
      </section>
    </main>
  )
}