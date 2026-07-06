import { z } from 'zod'

export const eventoAgendaSchema = z.object({
  fecha:       z.string().min(1, 'La fecha es obligatoria'),
  hora_inicio: z.string().min(1, 'La hora de inicio es obligatoria'),
  hora_fin:    z.string().optional(),
  grua_id:     z.string().uuid('Seleccioná una grúa'),
  empresa_id:  z.string().uuid('Seleccioná una empresa'),
  ubicacion:   z.string().optional(),
  notas:       z.string().optional(),
  estado:      z.enum(['programado', 'en_curso', 'finalizado', 'cancelado']).default('programado'),
})

export type EventoAgendaFormData = z.infer<typeof eventoAgendaSchema>

export const gruaSchema = z.object({
  nombre:              z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  patente:             z.string().optional(),
  capacidad_toneladas: z.coerce.number().min(0).optional(),
})

export const empresaAgendaSchema = z.object({
  nombre:   z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  contacto: z.string().optional(),
  telefono: z.string().optional(),
  notas:    z.string().optional(),
})

export const operarioSchema = z.object({
  nombre:   z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  telefono: z.string().optional(),
})
