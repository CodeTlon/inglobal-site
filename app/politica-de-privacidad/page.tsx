import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description:
    'Política de privacidad de Grúas InGlobal S.R.L.: qué datos recolectan el sitio web y la app InGlobal Agenda, y para qué se usan.',
  robots: { index: true, follow: true },
}

export default function PoliticaDePrivacidadPage() {
  return (
    <>
      <section className="pt-32 pb-16 bg-igb-surface-low">
        <div className="container-igb">
          <span className="label-tag">Información Legal</span>
          <h1 className="heading-display mb-4">Política de Privacidad</h1>
        </div>
      </section>

      <section className="section-pad bg-igb-surface">
        <div className="container-igb max-w-3xl">
          <div className="prose prose-slate max-w-none space-y-8">
            <div>
              <p className="text-igb-secondary leading-relaxed">
                Esta política aplica al sitio web <strong className="text-igb-on-surface">gruasinglobal.com</strong> y a la app móvil interna <strong className="text-igb-on-surface">InGlobal Agenda</strong>, ambos operados por Grúas InGlobal S.R.L. Describe qué datos recolectamos, para qué los usamos y qué derechos tenés sobre ellos.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-headline font-bold text-igb-on-surface mb-4">
                1. Qué datos recolectamos
              </h2>
              <ul className="mt-2 space-y-2 text-igb-secondary leading-relaxed">
                <li>
                  <strong className="text-igb-on-surface">Cuenta e inicio de sesión:</strong> email y credenciales de acceso del personal que usa la app InGlobal Agenda, gestionados a través de nuestro proveedor de autenticación (Supabase).
                </li>
                <li>
                  <strong className="text-igb-on-surface">Datos operativos de agenda:</strong> turnos, disponibilidad de grúas y operarios, y demás información de programación que el personal ingresa para coordinar el trabajo.
                </li>
                <li>
                  <strong className="text-igb-on-surface">Cámara:</strong> la app solicita acceso a la cámara únicamente para escanear el código QR que vincula una TV a la sesión de agenda. No se capturan, almacenan ni envían fotos ni video.
                </li>
                <li>
                  <strong className="text-igb-on-surface">Formulario de contacto del sitio:</strong> nombre, email y mensaje que un visitante decide enviarnos, usados solo para responder esa consulta.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-headline font-bold text-igb-on-surface mb-4">
                2. Para qué usamos estos datos
              </h2>
              <p className="text-igb-secondary leading-relaxed">
                Exclusivamente para operar la herramienta interna de agenda de Grúas InGlobal S.R.L. (coordinar grúas, operarios y turnos) y para responder consultas recibidas por el sitio web. No usamos estos datos con fines publicitarios ni los vendemos a terceros.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-headline font-bold text-igb-on-surface mb-4">
                3. Con quién se comparten
              </h2>
              <p className="text-igb-secondary leading-relaxed">
                Los datos se almacenan y procesan a través de nuestros proveedores de infraestructura: <strong className="text-igb-on-surface">Supabase</strong> (base de datos y autenticación) y <strong className="text-igb-on-surface">Vercel</strong> (hosting del sitio y de la API). No compartimos estos datos con terceros para fines propios de ellos; estos proveedores actúan como encargados de tratamiento, bajo sus propias políticas de seguridad.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-headline font-bold text-igb-on-surface mb-4">
                4. Cuánto tiempo los conservamos
              </h2>
              <p className="text-igb-secondary leading-relaxed">
                Los datos de agenda y de cuenta se conservan mientras la persona forme parte del personal operativo y la herramienta esté en uso. Los mensajes del formulario de contacto se conservan solo el tiempo necesario para atender la consulta.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-headline font-bold text-igb-on-surface mb-4">
                5. Tus derechos
              </h2>
              <p className="text-igb-secondary leading-relaxed">
                Podés solicitar acceso, rectificación o supresión de tus datos personales escribiendo a{' '}
                <a href="mailto:info@gruasinglobal.com" className="text-igb-navy underline">
                  info@gruasinglobal.com
                </a>.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-headline font-bold text-igb-on-surface mb-4">
                6. Cambios a esta política
              </h2>
              <p className="text-igb-secondary leading-relaxed">
                Podemos actualizar esta política si cambia lo que recolectamos o cómo lo usamos. La fecha de la última actualización figura al pie de esta página.
              </p>
            </div>

            <div className="pt-4 border-t border-igb-outline/30">
              <p className="text-igb-secondary/60 text-sm">
                Última actualización: agosto de 2026
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
