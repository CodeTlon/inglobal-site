import { z } from 'zod'

export const clienteSchema = z.object({
  name:      z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  logo:      z.string().min(1, 'El logo es obligatorio'),
  logo_focal: z.string().nullable().optional(),
  logo_focal_mobile: z.string().nullable().optional(),
  bio:       z.string().optional(),
  content:   z.string().optional(),
  featured:  z.coerce.boolean().default(true),
  work_rank: z.coerce.number().int().min(0).max(1000).default(10),
  published: z.coerce.boolean().default(true),
})

export type ClienteFormData = z.infer<typeof clienteSchema>
