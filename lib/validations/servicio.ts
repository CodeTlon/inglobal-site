import { z } from 'zod'

export const servicioSchema = z.object({
  slug:          z.string().min(2).regex(/^[a-z0-9-]+$/),
  title:         z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  desc:          z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  specs:         z.string().optional(), // una spec por línea; se parsea en la action
  img:           z.string().min(1, 'La imagen es obligatoria'),
  icon:          z.string().min(1, 'El ícono es obligatorio'),
  display_order: z.coerce.number().int().min(0).default(0),
  published:     z.coerce.boolean().default(true),
})

export type ServicioFormData = z.infer<typeof servicioSchema>
