'use client'
import { useFormState, useFormStatus } from 'react-dom'
import { sendContact } from '@/app/actions/contact'
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

const services = [
  { value: 'gruas-telescopicas', label: 'Grúas Telescópicas' },
  { value: 'hidrogruas', label: 'Hidrogrúas' },
  { value: 'movimientos-pesados', label: 'Movimientos Pesados' },
  { value: 'traslados', label: 'Traslados con Carretones' },
  { value: 'montajes', label: 'Montajes Industriales' },
  { value: 'otro', label: 'Otro' },
]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-igb-yellow text-igb-on-yellow py-4 rounded-md font-headline font-bold text-base hover:brightness-95 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Enviando...
        </>
      ) : (
        <>
          <Send className="w-4 h-4" />
          Enviar Consulta
        </>
      )}
    </button>
  )
}

const inputClass =
  'w-full bg-igb-surface-low border-b-2 border-igb-outline focus:border-igb-yellow-dark outline-none px-0 py-3 text-igb-on-surface text-sm placeholder:text-igb-secondary/50 transition-colors'

const labelClass = 'block text-xs font-bold text-igb-secondary uppercase tracking-wider mb-1'

interface ContactFormProps {
  defaultService?: string
}

export default function ContactForm({ defaultService }: ContactFormProps) {
  const [state, action] = useFormState(sendContact, null)

  if (state?.success) {
    return (
      <div
        data-testid="success-message"
        className="flex flex-col items-center justify-center py-16 text-center gap-4"
      >
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h3 className="text-2xl font-headline font-bold text-igb-on-surface">
          ¡Mensaje enviado!
        </h3>
        <p className="text-igb-secondary max-w-sm">
          Recibimos tu consulta y te respondemos a la brevedad. ¡Gracias por contactarnos!
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-6">
      {state?.error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{state.error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className={labelClass}>
            Nombre completo *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Tu nombre"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="empresa" className={labelClass}>
            Empresa
          </label>
          <input
            id="empresa"
            name="empresa"
            type="text"
            placeholder="Tu empresa (opcional)"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="email" className={labelClass}>
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            Teléfono
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Tu teléfono"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="servicio" className={labelClass}>
          Servicio de interés
        </label>
        <select
          id="servicio"
          name="servicio"
          defaultValue={defaultService ?? ''}
          className={`${inputClass} cursor-pointer bg-transparent`}
        >
          <option value="">Seleccionar servicio...</option>
          {services.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Mensaje *
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Contanos qué necesitás..."
          required
          className={`${inputClass} resize-none`}
        />
      </div>

      <SubmitButton />
    </form>
  )
}
