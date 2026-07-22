import { z } from 'zod'

export const trabajoSchema = z.object({
  cliente_id:    z.string().uuid('Cliente inválido.'),
  title:         z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  excerpt:       z.string().optional(),
  content:       z.string().optional(),
  cover_image:   z.string().optional(),
  youtube_url:   z.string().optional(),
  fecha:         z.string().nullable().optional(),
  attachment_url: z.string().nullable().optional(),
  cover_image_focal: z.string().nullable().optional(),
  cover_image_focal_mobile: z.string().nullable().optional(),
  banner_image:  z.string().optional(),
  banner_image_focal: z.string().nullable().optional(),
  banner_image_focal_mobile: z.string().nullable().optional(),
  banner_overlay_opacity: z.coerce.number().int('Valor inválido').min(0, 'Mínimo 0').max(100, 'Máximo 100').default(100),
  banner_overlay_opacity_mobile: z.coerce.number().int('Valor inválido').min(0, 'Mínimo 0').max(100, 'Máximo 100').nullable().optional(),
  display_order: z.coerce.number().int('El orden debe ser un número entero').min(0, 'El orden no puede ser negativo').default(0),
  published:     z.coerce.boolean().default(true),
}).refine(
  (data) => !data.fecha || data.fecha <= new Date().toISOString().slice(0, 10),
  { message: 'La fecha no puede ser futura', path: ['fecha'] }
)

export type TrabajoFormData = z.infer<typeof trabajoSchema>
