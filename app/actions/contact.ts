'use server'
import { clientIp } from '@/lib/client-ip'
import { headers } from 'next/headers'
import { Resend } from 'resend'
import { createRateLimiter } from '@/lib/rate-limit'
import { db } from '@/lib/db'
import { contactSchema } from '@/lib/validations/contact'

// Escapa HTML: name/empresa/message vienen de un formulario público y se interpolan en un email
// HTML hacia la casilla de la empresa — sin esto, cualquiera puede inyectar links o marcado.
function esc(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

// Sin esto el form es spameable sin límite — agota la cuota de envío de Resend
// o inunda la casilla. Mismo mecanismo que `app/api/auth/check-email/route.ts`
// (ver `lib/rate-limit.ts`), con un tope más chico porque acá cada hit real
// dispara un email de verdad, no solo una consulta a la DB.
const isRateLimited = createRateLimiter(60_000, 3)

const serviciosMap: Record<string, string> = {
  'gruas-telescopicas': 'Grúas Telescópicas',
  'hidrogruas': 'Hidrogrúas',
  'movimientos-pesados': 'Movimientos Pesados',
  'traslados': 'Traslados con Carretones',
  'montajes': 'Montajes Industriales',
  'otro': 'Otro',
}

export async function sendContact(prevState: unknown, formData: FormData) {
  const ip = clientIp(await headers())
  if (isRateLimited(ip)) {
    return { error: 'Demasiadas consultas. Esperá un minuto e intentá de nuevo.' }
  }

  const parsed = contactSchema.safeParse({
    name: formData.get('name'),
    empresa: formData.get('empresa'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    servicio: formData.get('servicio'),
    ubicacion: formData.get('ubicacion'),
    message: formData.get('message'),
  })

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message
    return { error: firstError ?? 'Datos inválidos. Verificá los campos.' }
  }

  const { name, empresa, email, phone, servicio, ubicacion, message } = parsed.data
  const servicioLabel = servicio ? (serviciosMap[servicio] ?? servicio) : null

  // 1) La consulta se guarda SIEMPRE en la base: si el envío del mail falla (clave, cuota,
  //    caída de Resend) no se pierde y queda visible en el panel (/dashboard/consultas).
  let leadId: string | null = null
  try {
    const { data, error } = await db
      .from('contact_leads')
      .insert({ name, empresa: empresa || null, email, phone: phone || null, servicio: servicio || null, ubicacion: ubicacion || null, message })
      .select('id')
      .single()
    if (error) console.error('[contact] no se pudo guardar la consulta:', error.message)
    else leadId = data.id
  } catch (err) {
    console.error('[contact] no se pudo guardar la consulta:', err)
  }

  // 2) Aviso por mail a la empresa. `new Resend(undefined)` lanza, por eso se crea acá y no
  //    a nivel de módulo.
  let emailed = false
  if (!process.env.RESEND_API_KEY) {
    console.error('[contact] falta RESEND_API_KEY: la consulta se guardó pero no se envió el mail')
  } else {
    const resend = new Resend(process.env.RESEND_API_KEY)
    try {
      // OJO: el SDK de Resend NO lanza ante un fallo de la API (403 por dominio sin verificar,
      // cuota, clave inválida): devuelve `{ error }`. Sin chequearlo, un mail que nunca salió
      // se daba por enviado.
      const { error: sendError } = await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME ?? 'InGlobal'} <${process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'}>`,
      to: process.env.COMPANY_EMAIL ?? 'cotizacionesinglobalsrl@gmail.com',
      replyTo: email,
      subject: `Nueva consulta de ${name.replace(/[\r\n]+/g, ' ')}${empresa ? ` — ${empresa.replace(/[\r\n]+/g, ' ')}` : ''}`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 0;">
          <!-- Header -->
          <div style="background: #0f172a; padding: 32px 40px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #f5d100; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
              Grúas InGlobal S.R.L.
            </h1>
            <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0;">Nueva consulta recibida</p>
          </div>
          <!-- Body -->
          <div style="background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 24px rgba(10,17,40,0.08);">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f5; color: #575d78; font-size: 13px; width: 140px; font-weight: 600;">Nombre</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f5; color: #191c1d; font-size: 14px;">${esc(name)}</td>
              </tr>
              ${empresa ? `<tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f5; color: #575d78; font-size: 13px; font-weight: 600;">Empresa</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f5; color: #191c1d; font-size: 14px;">${esc(empresa)}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f5; color: #575d78; font-size: 13px; font-weight: 600;">Email</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f5; font-size: 14px;"><a href="mailto:${esc(email)}" style="color: #6f5d00;">${esc(email)}</a></td>
              </tr>
              ${phone ? `<tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f5; color: #575d78; font-size: 13px; font-weight: 600;">Teléfono</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f5; color: #191c1d; font-size: 14px;"><a href="tel:${esc(phone)}" style="color: #6f5d00;">${esc(phone)}</a></td>
              </tr>` : ''}
              ${ubicacion ? `<tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f5; color: #575d78; font-size: 13px; font-weight: 600;">Ubicación</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f5; color: #191c1d; font-size: 14px;">${esc(ubicacion)}</td>
              </tr>` : ''}
              ${servicioLabel ? `<tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f5; color: #575d78; font-size: 13px; font-weight: 600;">Servicio</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f5; font-size: 14px;">
                  <span style="background: #fef9c3; color: #6f5d00; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700;">${esc(servicioLabel)}</span>
                </td>
              </tr>` : ''}
            </table>
            <!-- Message -->
            <div style="margin-top: 24px; background: #f8f9fa; border-radius: 8px; padding: 20px;">
              <p style="color: #575d78; font-size: 12px; font-weight: 700; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Mensaje</p>
              <p style="color: #191c1d; font-size: 14px; line-height: 1.6; margin: 0;">${esc(message).replace(/\n/g, '<br>')}</p>
            </div>
            <!-- CTA -->
            <div style="margin-top: 28px; text-align: center;">
              <a href="mailto:${esc(email)}" style="background: #f5d100; color: #221b00; padding: 12px 28px; border-radius: 6px; font-weight: 700; font-size: 14px; text-decoration: none; display: inline-block;">
                Responder a ${esc(name)}
              </a>
            </div>
          </div>
          <!-- Footer -->
          <p style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 20px;">
            © ${new Date().getFullYear()} Grúas InGlobal S.R.L. — Córdoba, Argentina
          </p>
        </div>
      `,
    })
      if (sendError) throw new Error(`${sendError.name}: ${sendError.message}`)
      emailed = true
    } catch (err) {
      console.error('[contact] error al enviar el mail:', err)
    }
  }

  if (leadId && emailed) {
    await db.from('contact_leads').update({ email_enviado: true }).eq('id', leadId)
  }

  // Éxito si la consulta quedó guardada o salió el mail; error solo si no pasó ninguna de las dos.
  if (!leadId && !emailed) {
    return { error: 'Hubo un error al enviar tu consulta. Intentá de nuevo o comunicate por WhatsApp.' }
  }
  return { success: true }
}
