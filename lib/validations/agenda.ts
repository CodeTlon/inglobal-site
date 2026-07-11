import { z } from 'zod'

export const eventoAgendaSchema = z.object({
  fecha:       z.string().min(1, 'La fecha es obligatoria'),
  hora_inicio: z.string().min(1, 'La hora de inicio es obligatoria'),
  hora_fin:    z.string().nullable().optional(),
  grua_id:     z.string().uuid('Seleccioná una grúa'),
  empresa_id:  z.string().uuid('Seleccioná una empresa'),
  ubicacion:   z.string().nullable().optional(),
  notas:       z.string().nullable().optional(),
  estado:      z.enum(['programado', 'en_curso', 'finalizado', 'cancelado']).default('programado'),
})

export type EventoAgendaFormData = z.infer<typeof eventoAgendaSchema>

export const gruaSchema = z.object({
  nombre:              z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  patente:             z.string().min(1, 'La patente es obligatoria'),
  capacidad_toneladas: z.coerce.number().positive('La capacidad debe ser mayor a 0'),
})

export const empresaAgendaSchema = z.object({
  nombre:   z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  contacto: z.string().nullable().optional(),
  telefono: z.string().nullable().optional(),
  notas:    z.string().nullable().optional(),
})

export const operarioSchema = z.object({
  nombre:   z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  telefono: z.string().min(1, 'El teléfono es obligatorio'),
})
