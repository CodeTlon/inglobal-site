import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aviso Legal',
  description: 'Aviso legal e información institucional de Grúas InGlobal S.R.L.',
  robots: { index: false, follow: false },
}

export default function AvisoLegalPage() {
  return (
    <>
      <section className="pt-32 pb-16 bg-igb-surface-low">
        <div className="container-igb">
          <span className="label-tag">Información Legal</span>
          <h1 className="heading-display mb-4">Aviso Legal</h1>
        </div>
      </section>

      <section className="section-pad bg-igb-surface">
        <div className="container-igb max-w-3xl">
          <div className="prose prose-slate max-w-none space-y-8">
            <div>
              <h2 className="text-2xl font-headline font-bold text-igb-on-surface mb-4">
                1. Identificación del titular
              </h2>
              <p className="text-igb-secondary leading-relaxed">
                En cumplimiento de la legislación vigente, se informa que el titular del presente sitio web es:
              </p>
              <ul className="mt-4 space-y-2 text-igb-secondary">
                <li><strong className="text-igb-on-surface">Razón Social:</strong> Grúas InGlobal S.R.L.</li>
                <li><strong className="text-igb-on-surface">Domicilio:</strong> Ana Riglos de Irigoyen S/N, Córdoba, Argentina</li>
                <li><strong className="text-igb-on-surface">Correo electrónico:</strong> info@gruasinglobal.com</li>
                <li><strong className="text-igb-on-surface">Teléfono:</strong> 0351 345-4244</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-headline font-bold text-igb-on-surface mb-4">
                2. Objeto del sitio web
              </h2>
              <p className="text-igb-secondary leading-relaxed">
                El presente sitio web tiene por objeto brindar información sobre los servicios ofrecidos por Grúas InGlobal S.R.L., incluyendo alquiler de grúas, hidrogrúas, movimientos especiales pesados y montajes industriales.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-headline font-bold text-igb-on-surface mb-4">
                3. Propiedad intelectual
              </h2>
              <p className="text-igb-secondary leading-relaxed">
                Todos los contenidos del sitio web (textos, imágenes, logotipos, código fuente) son propiedad de Grúas InGlobal S.R.L. o se utilizan con autorización de sus titulares. Queda prohibida su reproducción total o parcial sin autorización expresa.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-headline font-bold text-igb-on-surface mb-4">
                4. Responsabilidad
              </h2>
              <p className="text-igb-secondary leading-relaxed">
                Grúas InGlobal S.R.L. no se hace responsable de los daños y perjuicios que pudieran derivarse del uso del sitio web, incluyendo los producidos por virus o programas informáticos. La empresa se reserva el derecho de modificar el contenido del sitio en cualquier momento.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-headline font-bold text-igb-on-surface mb-4">
                5. Protección de datos
              </h2>
              <p className="text-igb-secondary leading-relaxed">
                Los datos personales proporcionados a través del formulario de contacto serán utilizados exclusivamente para responder a la consulta del usuario. En ningún caso serán cedidos a terceros sin consentimiento previo. El usuario puede ejercer sus derechos de acceso, rectificación y supresión contactando a info@gruasinglobal.com.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-headline font-bold text-igb-on-surface mb-4">
                6. Ley aplicable y jurisdicción
              </h2>
              <p className="text-igb-secondary leading-relaxed">
                Las presentes condiciones se rigen por la legislación argentina. Para la resolución de cualquier controversia derivada del uso de este sitio, las partes se someten a los tribunales ordinarios de la ciudad de Córdoba, Argentina.
              </p>
            </div>

            <div className="pt-4 border-t border-igb-outline/30">
              <p className="text-igb-secondary/60 text-sm">
                Última actualización: abril de 2026
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
