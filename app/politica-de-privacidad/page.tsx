import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  alternates: { canonical: '/politica-de-privacidad' },
  description:
    'Política de privacidad de Grúas Inglobal S.R.L.: qué datos recolectan el sitio web y la app Inglobal Agenda, para qué se usan y cómo pedir que se eliminen.',
  robots: { index: true, follow: true },
}

const CONTACTO = 'cotizacionesinglobalsrl@gmail.com'

function Titulo({ children }: { children: ReactNode }) {
  return <h2 className="text-2xl font-headline font-bold text-igb-on-surface mb-4">{children}</h2>
}

function Item({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <li>
      <strong className="text-igb-on-surface">{titulo}:</strong> {children}
    </li>
  )
}

function Mail() {
  return (
    <a href={`mailto:${CONTACTO}`} className="text-igb-navy underline">
      {CONTACTO}
    </a>
  )
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
                Esta política aplica al sitio web <strong className="text-igb-on-surface">gruasinglobal.com</strong> y a la app móvil <strong className="text-igb-on-surface">Inglobal Agenda</strong> (iOS y Android), ambos operados por Grúas Inglobal S.R.L. Describe qué datos recolectamos, para qué los usamos, con quién se comparten y cómo pedir que se eliminen.
              </p>
              <p className="text-igb-secondary leading-relaxed mt-4">
                Inglobal Agenda es una herramienta de uso interno para el personal de Grúas Inglobal S.R.L. La app no permite registrarse: las cuentas las crea la empresa para cada persona autorizada.
              </p>
            </div>

            <div>
              <Titulo>1. Qué datos recolectamos</Titulo>
              <ul className="mt-2 space-y-2 text-igb-secondary leading-relaxed">
                <Item titulo="Cuenta e inicio de sesión">
                  nombre, email y contraseña (guardada cifrada) de cada persona autorizada a usar la app. Al iniciar sesión, la app guarda un token de sesión en el almacenamiento seguro del teléfono.
                </Item>
                <Item titulo="Datos operativos de agenda">
                  servicios, fechas y horarios, ubicación de la obra, estado de cada servicio, grúas y operarios asignados, y demás información que el personal ingresa para coordinar el trabajo.
                </Item>
                <Item titulo="Catálogo de grúas, operarios y empresas">
                  nombre, teléfono de contacto, roles y la foto o logo que el personal carga para cada grúa, operario o empresa cliente.
                </Item>
                <Item titulo="Cámara y galería de fotos">
                  la app pide acceso a la cámara solo para escanear el código QR que vincula una TV a la agenda; no se guardan ni se envían fotos ni video de esa lectura. El acceso a la galería se usa para elegir la foto o el logo de un elemento del catálogo; esas fotos sí se suben y guardan, como se indica en el punto anterior.
                </Item>
                <Item titulo="Notificaciones push">
                  si aceptás recibir avisos, la app registra un identificador de notificaciones del dispositivo (token push) junto con la plataforma (iOS o Android). Se usa únicamente para enviar avisos de la agenda. Podés desactivarlos en cualquier momento desde Perfil o desde los ajustes del teléfono; al cerrar sesión, el identificador se da de baja.
                </Item>
                <Item titulo="Formulario de contacto del sitio">
                  nombre, email y mensaje que un visitante decide enviarnos, usados solo para responder esa consulta.
                </Item>
              </ul>
              <p className="text-igb-secondary leading-relaxed mt-4">
                La app no recolecta ubicación del dispositivo, contactos, datos de salud ni información financiera, y no incluye publicidad ni herramientas de análisis o rastreo de terceros.
              </p>
            </div>

            <div>
              <Titulo>2. Para qué usamos estos datos</Titulo>
              <p className="text-igb-secondary leading-relaxed">
                Exclusivamente para operar la agenda interna de Grúas Inglobal S.R.L. (coordinar grúas, operarios y servicios y avisar sobre ellos) y para responder consultas recibidas por el sitio web. No usamos estos datos con fines publicitarios, no los vendemos y no los usamos para rastrear a las personas entre apps o sitios de otras empresas.
              </p>
            </div>

            <div>
              <Titulo>3. Con quién se comparten</Titulo>
              <p className="text-igb-secondary leading-relaxed">
                No compartimos los datos con terceros para fines propios de ellos. Solo intervienen proveedores que prestan un servicio técnico y actúan como encargados de tratamiento:
              </p>
              <ul className="mt-2 space-y-2 text-igb-secondary leading-relaxed">
                <Item titulo="Servidores y almacenamiento">
                  servidores privados contratados por la empresa, donde se alojan la base de datos, el sitio, la API de la app y las fotos del catálogo, y un servicio de copias de seguridad en la nube (Backblaze B2).
                </Item>
                <Item titulo="Envío de notificaciones">
                  Expo (servicio de notificaciones push de la app), Apple Push Notification service en iPhone y Firebase Cloud Messaging de Google en Android. Reciben solo el identificador del dispositivo y el texto del aviso.
                </Item>
                <Item titulo="Correo">
                  Resend, para enviar los mensajes del formulario de contacto.
                </Item>
              </ul>
            </div>

            <div>
              <Titulo>4. Cuánto tiempo los conservamos</Titulo>
              <p className="text-igb-secondary leading-relaxed">
                Los datos de cuenta se conservan mientras la persona forme parte del personal autorizado. Los datos de agenda se conservan mientras la herramienta esté en uso, porque forman el historial de servicios de la empresa. Los identificadores de notificaciones se borran al cerrar sesión o desactivar los avisos. Los mensajes del formulario de contacto se conservan solo el tiempo necesario para atender la consulta.
              </p>
            </div>

            <div>
              <Titulo>5. Cómo eliminar tu cuenta y tus datos</Titulo>
              <p className="text-igb-secondary leading-relaxed">
                Para eliminar tu cuenta de Inglobal Agenda y tus datos personales, escribí a <Mail /> desde el email de tu cuenta, o pedíselo al administrador de la agenda en la empresa. Eliminamos la cuenta y los datos personales asociados dentro de los 30 días. Los registros de servicios ya realizados pueden conservarse como historial de la empresa, sin datos de acceso de la cuenta eliminada.
              </p>
            </div>

            <div>
              <Titulo>6. Tus derechos</Titulo>
              <p className="text-igb-secondary leading-relaxed">
                Podés pedir acceso, rectificación o supresión de tus datos personales escribiendo a <Mail />, conforme a la Ley 25.326 de Protección de los Datos Personales. La Agencia de Acceso a la Información Pública, órgano de control de esa ley, atiende denuncias y reclamos sobre su cumplimiento.
              </p>
            </div>

            <div>
              <Titulo>7. Seguridad</Titulo>
              <p className="text-igb-secondary leading-relaxed">
                Todas las comunicaciones entre la app, el sitio y nuestros servidores viajan cifradas (HTTPS). Las contraseñas se guardan cifradas y el acceso a los datos de la agenda requiere una sesión válida.
              </p>
            </div>

            <div>
              <Titulo>8. Cambios a esta política</Titulo>
              <p className="text-igb-secondary leading-relaxed">
                Podemos actualizar esta política si cambia lo que recolectamos o cómo lo usamos. La fecha de la última actualización figura al pie de esta página.
              </p>
            </div>

            <div className="pt-4 border-t border-igb-outline/30">
              <p className="text-igb-secondary/60 text-sm">Última actualización: noviembre de 2026</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
