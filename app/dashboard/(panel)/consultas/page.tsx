import { Inbox, Mail, Phone, MapPin } from 'lucide-react'
import PageHeader from '@/components/dashboard/PageHeader'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

type Consulta = {
  id: string
  created_at: string
  name: string
  empresa: string | null
  email: string
  phone: string | null
  servicio: string | null
  ubicacion: string | null
  message: string
  email_enviado: boolean
}

const SERVICIOS: Record<string, string> = {
  'gruas-telescopicas': 'Grúas Telescópicas',
  hidrogruas: 'Hidrogrúas',
  'movimientos-pesados': 'Movimientos Pesados',
  traslados: 'Traslados con Carretones',
  montajes: 'Montajes Industriales',
  otro: 'Otro',
}

/** Consultas del formulario de contacto del sitio (las más recientes primero). */
export default async function ConsultasPage() {
  const { data, error } = await db
    .from('contact_leads')
    .select('id, created_at, name, empresa, email, phone, servicio, ubicacion, message, email_enviado')
    .order('created_at', { ascending: false })
    .limit(200)
  const consultas: Consulta[] = data ?? []

  return (
    <div className="max-w-3xl">
      <PageHeader title="Consultas" description="Mensajes recibidos desde el formulario de contacto del sitio." />

      {error && <p className="text-sm text-red-600 mb-4">No se pudieron cargar las consultas.</p>}

      {consultas.length === 0 && !error && (
        <div className="bg-white rounded-2xl p-8 shadow-igb border border-zinc-100 text-center">
          <Inbox size={28} className="mx-auto text-zinc-300 mb-3" aria-hidden />
          <p className="text-sm text-zinc-500">Todavía no llegaron consultas.</p>
        </div>
      )}

      <ul className="space-y-4">
        {consultas.map((c) => (
          <li key={c.id} className="bg-white rounded-2xl p-5 shadow-igb border border-zinc-100">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
              <div>
                <p className="text-sm font-bold text-zinc-900">{c.name}{c.empresa ? ` · ${c.empresa}` : ''}</p>
                <p className="text-xs text-zinc-400">
                  {new Date(c.created_at).toLocaleString('es-AR', { timeZone: 'America/Argentina/Cordoba' })}
                  {c.servicio ? ` · ${SERVICIOS[c.servicio] ?? c.servicio}` : ''}
                </p>
              </div>
              {!c.email_enviado && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-sm bg-amber-50 text-amber-700 border border-amber-200">
                  Mail no enviado
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-700 whitespace-pre-line mb-3">{c.message}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-500">
              <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1.5 hover:text-zinc-900">
                <Mail size={13} aria-hidden /> {c.email}
              </a>
              {c.phone && (
                <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1.5 hover:text-zinc-900">
                  <Phone size={13} aria-hidden /> {c.phone}
                </a>
              )}
              {c.ubicacion && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={13} aria-hidden /> {c.ubicacion}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
