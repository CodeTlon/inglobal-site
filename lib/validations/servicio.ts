import { z } from 'zod'

export const servicioSchema = z.object({
  slug:          z.string().min(2, 'El slug debe tener al menos 2 caracteres').regex(/^[a-z0-9-]+$/, 'El slug solo puede tener minúsculas, números y guiones'),
  title:         z.string().min(3, 'El título debe tener al menos 3 caracteres').max(60, 'Máximo 60 caracteres'),
  desc:          z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  excerpt:       z.string().min(10, 'La descripción corta debe tener al menos 10 caracteres').max(80, 'La descripción corta debe tener como máximo 80 caracteres'),
  specs:         z.string().optional(), // JSON array (StringList) en el form; se parsea en la action
  img:           z.string().min(1, 'La imagen es obligatoria'),
  icon:          z.string().min(1, 'El ícono es obligatorio'),
  display_order: z.coerce.number().int('El orden debe ser un número entero').min(0, 'El orden no puede ser negativo').default(0),
  published:     z.coerce.boolean().default(true),
})

export type ServicioFormData = z.infer<typeof servicioSchema>
