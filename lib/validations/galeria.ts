import { z } from 'zod'

export const galeriaSchema = z.object({
  imagen:           z.string().min(1, 'La imagen es obligatoria'),
  alt:              z.string().min(3, 'El texto alternativo debe tener al menos 3 caracteres'),
  col_span_mobile:  z.coerce.number().int('Valor inválido').min(1, 'Mínimo 1').max(2, 'Máximo 2').default(1),
  row_span_mobile:  z.coerce.number().int('Valor inválido').min(1, 'Mínimo 1').max(2, 'Máximo 2').default(1),
  col_span_desktop: z.coerce.number().int('Valor inválido').min(1, 'Mínimo 1').max(4, 'Máximo 4').default(1),
  row_span_desktop: z.coerce.number().int('Valor inválido').min(1, 'Mínimo 1').max(2, 'Máximo 2').default(1),
  display_order:    z.coerce.number().int('El orden debe ser un número entero').min(0, 'El orden no puede ser negativo').default(0),
  published:        z.coerce.boolean().default(true),
})

export type GaleriaFormData = z.infer<typeof galeriaSchema>
