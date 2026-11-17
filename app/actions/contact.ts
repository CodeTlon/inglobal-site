'use server'
import { clientIp } from '@/lib/client-ip'
import { headers } from 'next/headers'
import { Resend } from 'resend'
import { createRateLimiter } from '@/lib/rate-limit'
import { db } from '@/lib/db'
import { contactSchema } from '@/lib/validations/contact'
import { contactEmailHtml, contactEmailSubject, contactEmailText } from '@/lib/email/contact-template'

// Sin esto el form es spameable sin límite — agota la cuota de envío de Resend
// o inunda la casilla. Mismo mecanismo que `app/api/auth/check-email/route.ts`
// (ver `lib/rate-limit.ts`), con un tope más chico porque acá cada hit real
// dispara un email de verdad, no solo una consulta a la DB.
const isRateLimited = createRateLimiter('contacto', 60_000, 3)

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
  if (await isRateLimited(ip)) {
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
    const emailData = { name, empresa, email, phone, ubicacion, servicio: servicioLabel, message }
    try {
      // OJO: el SDK de Resend NO lanza ante un fallo de la API (403 por dominio sin verificar,
      // cuota, clave inválida): devuelve `{ error }`. Sin chequearlo, un mail que nunca salió
      // se daba por enviado.
      const { error: sendError } = await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME ?? 'Inglobal'} <${process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'}>`,
      to: process.env.COMPANY_EMAIL ?? 'cotizacionesinglobalsrl@gmail.com',
      replyTo: email,
      subject: contactEmailSubject(emailData),
      html: contactEmailHtml(emailData),
      text: contactEmailText(emailData),
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
