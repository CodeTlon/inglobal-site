import { z } from 'zod'

export const trabajoSchema = z.object({
  cliente_id:    z.string().uuid('Cliente inválido.'),
  title:         z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  excerpt:       z.string().optional(),
  content:       z.string().optional(),
  cover_image:   z.string().optional(),
  youtube_url:   z.string().optional(),
  display_order: z.coerce.number().int().min(0).default(0),
  published:     z.coerce.boolean().default(true),
})

export type TrabajoFormData = z.infer<typeof trabajoSchema>
