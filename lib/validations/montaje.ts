import { z } from 'zod'

export const montajeSchema = z.object({
  slug:          z.string().min(2, 'El slug debe tener al menos 2 caracteres').regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  title:         z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  excerpt:       z.string().optional(),
  content:       z.string().optional(),
  cover_image:   z.string().optional(),
  cover_image_focal: z.string().nullable().optional(),
  tags:          z.string().optional(), // CSV en el form; se parsea en la action
  display_order: z.coerce.number().int().min(0).default(0),
  published:     z.coerce.boolean().default(true),
})

export type MontajeFormData = z.infer<typeof montajeSchema>
