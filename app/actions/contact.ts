'use server'
import { Resend } from 'resend'
import { contactSchema } from '@/lib/validations/contact'

const resend = new Resend(process.env.RESEND_API_KEY)

const serviciosMap: Record<string, string> = {
  'gruas-telescopicas': 'Grúas Telescópicas',
  'hidrogruas': 'Hidrogrúas',
  'movimientos-pesados': 'Movimientos Pesados',
  'traslados': 'Traslados con Carretones',
  'montajes': 'Montajes Industriales',
  'otro': 'Otro',
}

export async function sendContact(prevState: unknown, formData: FormData) {
  const parsed = contactSchema.safeParse({
    name: formData.get('name'),
    empresa: formData.get('empresa'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    servicio: formData.get('servicio'),
    message: formData.get('message'),
  })

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message
    return { error: firstError ?? 'Datos inválidos. Verificá los campos.' }
  }

  const { name, empresa, email, phone, servicio, message } = parsed.data
  const servicioLabel = servicio ? (serviciosMap[servicio] ?? servicio) : null

  try {
    // El lead queda registrado en la casilla de info@gruasinglobal.com (sin DB)
    await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME ?? 'InGlobal'} <${process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'}>`,
      to: process.env.COMPANY_EMAIL ?? 'info@gruasinglobal.com',
      replyTo: email,
      subject: `Nueva consulta de ${name}${empresa ? ` — ${empresa}` : ''}`,
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
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f5; color: #191c1d; font-size: 14px;">${name}</td>
              </tr>
              ${empresa ? `<tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f5; color: #575d78; font-size: 13px; font-weight: 600;">Empresa</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f5; color: #191c1d; font-size: 14px;">${empresa}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f5; color: #575d78; font-size: 13px; font-weight: 600;">Email</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f5; font-size: 14px;"><a href="mailto:${email}" style="color: #6f5d00;">${email}</a></td>
              </tr>
              ${phone ? `<tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f5; color: #575d78; font-size: 13px; font-weight: 600;">Teléfono</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f5; color: #191c1d; font-size: 14px;"><a href="tel:${phone}" style="color: #6f5d00;">${phone}</a></td>
              </tr>` : ''}
              ${servicioLabel ? `<tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f5; color: #575d78; font-size: 13px; font-weight: 600;">Servicio</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f5; font-size: 14px;">
                  <span style="background: #fef9c3; color: #6f5d00; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700;">${servicioLabel}</span>
                </td>
              </tr>` : ''}
            </table>
            <!-- Message -->
            <div style="margin-top: 24px; background: #f8f9fa; border-radius: 8px; padding: 20px;">
              <p style="color: #575d78; font-size: 12px; font-weight: 700; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Mensaje</p>
              <p style="color: #191c1d; font-size: 14px; line-height: 1.6; margin: 0;">${message.replace(/\n/g, '<br>')}</p>
            </div>
            <!-- CTA -->
            <div style="margin-top: 28px; text-align: center;">
              <a href="mailto:${email}" style="background: #f5d100; color: #221b00; padding: 12px 28px; border-radius: 6px; font-weight: 700; font-size: 14px; text-decoration: none; display: inline-block;">
                Responder a ${name}
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

    return { success: true }
  } catch (err) {
    console.error('Contact form error:', err)
    return { error: 'Hubo un error al enviar tu consulta. Intentá de nuevo o comunicate por WhatsApp.' }
  }
}
