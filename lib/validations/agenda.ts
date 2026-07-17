import { z } from 'zod'

const MIN_DURACION_MIN = 15

export const eventoAgendaSchema = z.object({
  fecha:       z.string().min(1, 'La fecha es obligatoria'),
  fecha_hasta: z.string().nullable().optional(),
  hora_inicio: z.string().min(1, 'La hora de inicio es obligatoria'),
  hora_fin:    z.string().nullable().optional(),
  grua_id:     z.string().uuid('Seleccioná una grúa'),
  empresa_id:  z.string().uuid('Seleccioná una empresa'),
  ubicacion:   z.string().nullable().optional(),
  notas:       z.string().nullable().optional(),
  estado:      z.enum(['programado', 'en_curso', 'finalizado', 'cancelado']).default('programado'),
}).superRefine((data, ctx) => {
  const hoy = new Date().toISOString().slice(0, 10)
  if (data.fecha < hoy) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['fecha'], message: 'La fecha no puede ser anterior a hoy' })
  }
  if (data.fecha_hasta && data.fecha_hasta < data.fecha) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['fecha_hasta'], message: 'La fecha de fin no puede ser anterior a la fecha de inicio' })
  }
  if (data.hora_fin) {
    const [hi, mi] = data.hora_inicio.split(':').map(Number)
    const [hf, mf] = data.hora_fin.split(':').map(Number)
    if (hf * 60 + mf < hi * 60 + mi + MIN_DURACION_MIN) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['hora_fin'], message: `La hora de fin debe ser al menos ${MIN_DURACION_MIN} minutos después de la de inicio` })
    }
  }
})

export type EventoAgendaFormData = z.infer<typeof eventoAgendaSchema>

export const TIPOS_GRUA = ['Grúa', 'Hidrogrúa', 'Camión', 'Otro'] as const

export const gruaSchema = z.object({
  nombre:              z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  patente:             z.string().min(1, 'La patente es obligatoria'),
  capacidad_toneladas: z.coerce.number().positive('La capacidad debe ser mayor a 0'),
  tipo:                z.enum(TIPOS_GRUA).default('Grúa'),
})

export const empresaAgendaSchema = z.object({
  nombre:   z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  contacto: z.string().min(1, 'El contacto es obligatorio'),
  telefono: z.string().min(1, 'El teléfono es obligatorio'),
  notas:    z.string().nullable().optional(),
})

export const operarioSchema = z.object({
  nombre:   z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  telefono: z.string().min(1, 'El teléfono es obligatorio'),
})
