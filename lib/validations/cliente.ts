import { z } from 'zod'

export const clienteSchema = z.object({
  slug:      z.string().min(2, 'El slug debe tener al menos 2 caracteres').regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  name:      z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  logo:      z.string().min(1, 'El logo es obligatorio'),
  bio:       z.string().optional(),
  content:   z.string().optional(),
  featured:  z.coerce.boolean().default(true),
  work_rank: z.coerce.number().int().min(0).max(1000).default(10),
  published: z.coerce.boolean().default(true),
})

export type ClienteFormData = z.infer<typeof clienteSchema>
