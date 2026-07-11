'use client'

import { useFormState } from 'react-dom'
import {
  TextField,
  TextArea,
  NumberField,
  ImageUpload,
  Checkbox,
} from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import { AlertCircle } from 'lucide-react'
import type { Cliente } from '@/lib/content'
import type { ClienteState } from '@/app/actions/clientes'

interface Props {
  cliente?: Cliente
  entityId?: string
  action: (prevState: unknown, formData: FormData) => Promise<ClienteState>
}

export default function ClienteForm({ cliente, entityId, action }: Props) {
  const [state, formAction] = useFormState(action, undefined)

  return (
    <form action={formAction} className="space-y-6">
      {entityId && <input type="hidden" name="id" value={entityId} />}

      {state?.error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{state.error}</p>
        </div>
      )}

      <TextField label="Nombre" name="name" defaultValue={cliente?.name} required />
      <TextField
        label="Slug (URL)"
        name="slug"
        defaultValue={cliente?.slug}
        hint={cliente ? 'Modificar el slug cambia la URL pública del cliente.' : 'Identificador único. Solo letras, números y guiones.'}
        required
      />

      <TextArea
        label="Bio (descripción corta)"
        name="bio"
        defaultValue={cliente?.bio ?? undefined}
        rows={3}
        hint="Se muestra en el header de la página de detalle y como descripción."
      />

      <TextArea
        label="Contenido (texto completo)"
        name="content"
        defaultValue={cliente?.content ?? undefined}
        rows={6}
        hint="Texto de la página de detalle. Separar párrafos con una línea en blanco."
      />

      <ImageUpload
        label="Logo"
        name="logo"
        defaultValue={cliente?.logo}
        folder="clientes"
        hint="Logo de la empresa. PNG con fondo transparente recomendado. Máximo 12px de alto en uso."
      />

      <NumberField
        label="Ranking de trabajo (work_rank)"
        name="work_rank"
        defaultValue={cliente?.work_rank}
        min={0}
        hint="Número mayor = aparece primero en el home y en /clientes."
      />

      <Checkbox label="Publicado" name="published" defaultChecked={cliente?.published ?? true} hint="Si está destildado, no se muestra en el sitio público." />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
