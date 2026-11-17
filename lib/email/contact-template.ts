/**
 * Mail de aviso de consulta nueva (formulario de /contacto) que le llega a la empresa.
 * Maquetado con tablas y estilos inline: Gmail, Outlook y los clientes de celular ignoran
 * <style>, flex y buena parte del CSS moderno. Incluye versión de texto plano (mejora la
 * entrega y es lo que muestran algunos relojes/notificaciones).
 */
import { SITE_URL } from '@/lib/site'

export type ContactEmailData = {
  name: string
  empresa?: string | null
  email: string
  phone?: string | null
  ubicacion?: string | null
  servicio?: string | null // ya traducido a etiqueta legible
  message: string
  fecha?: Date
}

// Escapa HTML: todo viene de un formulario público y se interpola en el mail.
function esc(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

/**
 * Teléfono argentino → número para wa.me (54 9 + área + número, sin 0 ni 15).
 * Best effort: si no se puede normalizar con seguridad devuelve null y no se muestra el botón.
 */
export function whatsappNumber(phone: string): string | null {
  let d = phone.replace(/\D/g, '')
  if (d.startsWith('00')) d = d.slice(2)
  if (d.startsWith('54')) {
    d = d.slice(2)
    if (d.startsWith('9')) d = d.slice(1)
  }
  if (d.startsWith('0')) d = d.slice(1)
  // Número nacional con el "15" de celular: 12 dígitos. Se prueba el código de área de 3
  // (Córdoba 351, el caso más común), después 4 y 2.
  if (d.length === 12) {
    for (const area of [3, 4, 2]) {
      if (d.slice(area, area + 2) === '15') {
        d = d.slice(0, area) + d.slice(area + 2)
        break
      }
    }
  }
  return d.length === 10 ? `549${d}` : null
}

const C = {
  navy: '#0f172a',
  yellow: '#f5d100',
  onYellow: '#221b00',
  text: '#191c1d',
  muted: '#575d78',
  soft: '#94a3b8',
  line: '#eceef0',
  bg: '#f3f4f6',
  card: '#ffffff',
  link: '#6f5d00',
}

function row(label: string, valueHtml: string): string {
  return `<tr>
    <td style="padding:12px 0;border-bottom:1px solid ${C.line};color:${C.muted};font-size:13px;font-weight:600;width:120px;vertical-align:top;">${label}</td>
    <td style="padding:12px 0;border-bottom:1px solid ${C.line};color:${C.text};font-size:15px;vertical-align:top;">${valueHtml}</td>
  </tr>`
}

function button(href: string, label: string, primary: boolean): string {
  const bg = primary ? C.yellow : C.navy
  const fg = primary ? C.onYellow : '#ffffff'
  return `<a href="${href}" style="display:inline-block;background:${bg};color:${fg};padding:12px 22px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;margin:4px;">${label}</a>`
}

export function contactEmailSubject(d: ContactEmailData): string {
  const clean = (s: string) => s.replace(/[\r\n]+/g, ' ').trim()
  const quien = d.empresa ? `${clean(d.name)} (${clean(d.empresa)})` : clean(d.name)
  return d.servicio ? `Nueva consulta: ${clean(d.servicio)} — ${quien}` : `Nueva consulta de ${quien}`
}

export function contactEmailHtml(d: ContactEmailData): string {
  const fecha = (d.fecha ?? new Date()).toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Cordoba',
    dateStyle: 'full',
    timeStyle: 'short',
  })
  const wa = d.phone ? whatsappNumber(d.phone) : null
  const asunto = encodeURIComponent('Re: tu consulta a Grúas Inglobal')
  const preheader = `${d.name}${d.servicio ? ` · ${d.servicio}` : ''}${d.ubicacion ? ` · ${d.ubicacion}` : ''} — ${d.message.slice(0, 90)}`

  const filas = [
    row('Nombre', `<strong>${esc(d.name)}</strong>`),
    d.empresa ? row('Empresa', esc(d.empresa)) : '',
    d.servicio
      ? row('Servicio', `<span style="background:#fef9c3;color:${C.link};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;">${esc(d.servicio)}</span>`)
      : '',
    d.ubicacion ? row('Ubicación', esc(d.ubicacion)) : '',
    row('Email', `<a href="mailto:${esc(d.email)}" style="color:${C.link};">${esc(d.email)}</a>`),
    d.phone ? row('Teléfono', `<a href="tel:${esc(d.phone.replace(/[^\d+]/g, ''))}" style="color:${C.link};">${esc(d.phone)}</a>`) : '',
  ].join('')

  const botones = [
    button(`mailto:${esc(d.email)}?subject=${asunto}`, 'Responder por email', true),
    wa ? button(`https://wa.me/${wa}`, 'Escribir por WhatsApp', false) : '',
    d.phone && !wa ? button(`tel:${esc(d.phone.replace(/[^\d+]/g, ''))}`, 'Llamar', false) : '',
  ].join('')

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(contactEmailSubject(d))}</title>
</head>
<body style="margin:0;padding:0;background:${C.bg};font-family:Inter,Segoe UI,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.bg};">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
      <!-- Encabezado -->
      <tr><td style="background:${C.navy};padding:24px 32px;border-radius:12px 12px 0 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:middle;">
            <img src="${SITE_URL}/images/logo.png" width="120" alt="Grúas Inglobal" style="display:block;border:0;height:auto;max-width:120px;">
          </td>
          <td align="right" style="vertical-align:middle;">
            <span style="display:inline-block;background:${C.yellow};color:${C.onYellow};font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:5px 10px;border-radius:20px;">Consulta nueva</span>
          </td>
        </tr></table>
      </td></tr>
      <!-- Franja amarilla -->
      <tr><td style="background:${C.yellow};height:4px;line-height:4px;font-size:0;">&nbsp;</td></tr>
      <!-- Cuerpo -->
      <tr><td style="background:${C.card};padding:32px;">
        <p style="margin:0 0 4px;color:${C.text};font-size:20px;font-weight:800;">${esc(d.name)} quiere una cotización</p>
        <p style="margin:0 0 24px;color:${C.soft};font-size:13px;">Recibida el ${esc(fecha)} desde el formulario de gruasinglobal.com</p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${filas}</table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
          <tr><td style="background:#f8f9fa;border-left:4px solid ${C.yellow};border-radius:6px;padding:18px 20px;">
            <p style="margin:0 0 8px;color:${C.muted};font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;">Mensaje</p>
            <p style="margin:0;color:${C.text};font-size:15px;line-height:1.6;">${esc(d.message).replace(/\n/g, '<br>')}</p>
          </td></tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
          <tr><td align="center">${botones}</td></tr>
        </table>
        <p style="margin:16px 0 0;text-align:center;color:${C.soft};font-size:12px;">Si respondés este mail, la respuesta le llega directo a ${esc(d.name)}.</p>
      </td></tr>
      <!-- Pie -->
      <tr><td style="background:${C.card};border-top:1px solid ${C.line};padding:16px 32px;border-radius:0 0 12px 12px;text-align:center;">
        <a href="${SITE_URL}/dashboard/consultas" style="color:${C.muted};font-size:12px;">Ver todas las consultas en el panel</a>
      </td></tr>
      <tr><td style="padding:16px;text-align:center;color:${C.soft};font-size:11px;">
        © ${new Date().getFullYear()} Grúas Inglobal S.R.L. — Córdoba, Argentina
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}

export function contactEmailText(d: ContactEmailData): string {
  const lineas = [
    `Consulta nueva desde gruasinglobal.com`,
    ``,
    `Nombre: ${d.name}`,
    d.empresa ? `Empresa: ${d.empresa}` : null,
    d.servicio ? `Servicio: ${d.servicio}` : null,
    d.ubicacion ? `Ubicación: ${d.ubicacion}` : null,
    `Email: ${d.email}`,
    d.phone ? `Teléfono: ${d.phone}` : null,
    ``,
    `Mensaje:`,
    d.message,
    ``,
    `Respondé este mail para contestarle directo. Todas las consultas: ${SITE_URL}/dashboard/consultas`,
  ]
  return lineas.filter((l) => l !== null).join('\n')
}
