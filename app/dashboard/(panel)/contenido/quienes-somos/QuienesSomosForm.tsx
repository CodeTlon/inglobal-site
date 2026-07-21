'use client'

import { useFormState } from 'react-dom'
import { updateSiteSettings } from '@/app/actions/settings'
import { TextField, TextArea, ImageUpload, StringList } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import { AlertCircle } from 'lucide-react'
import InlineSavedBanner from '@/components/dashboard/InlineSavedBanner'

const action = updateSiteSettings.bind(null, 'quienes_somos')

export default function QuienesSomosForm({ settings }: { settings: Record<string, unknown> }) {
  const [state, formAction] = useFormState(action, null)

  return (
    <form action={formAction} className="space-y-6">
      <InlineSavedBanner trigger={state} />
      {state?.error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{state.error}</p>
        </div>
      )}

      <TextField label="Label (etiqueta)" name="label" defaultValue={settings.label as string} placeholder="Quiénes Somos" />
      <TextField label="Título (h1)" name="heading" defaultValue={settings.heading as string} placeholder="Grúas InGlobal S.R.L." />
      <TextArea
        label="Subtítulo (debajo del título)"
        name="subheading"
        defaultValue={settings.subheading as string}
        rows={2}
        hint="Párrafo corto debajo del H1, en la cabecera de la página."
        placeholder="Ej: Más de 40 años acompañando a la industria argentina con soluciones de elevación y logística pesada."
      />
      <TextField label="Nombre empresa" name="company_name" defaultValue={settings.company_name as string} placeholder="Inglobal" />

      <TextArea
        label="Descripción 1"
        name="description1"
        defaultValue={settings.description1 as string}
        rows={4}
        hint="Primer párrafo de texto de la empresa."
        placeholder="Ej: Somos una empresa cordobesa con más de 20 años de trayectoria en izaje, montaje y transporte de maquinaria pesada."
      />
      <TextArea
        label="Descripción 2"
        name="description2"
        defaultValue={settings.description2 as string}
        rows={4}
        hint="Segundo párrafo de texto de la empresa."
        placeholder="Ej: Contamos con una flota propia y un equipo capacitado para responder a cada desafío operativo con seguridad."
      />

      <ImageUpload
        label="Imagen de la sección"
        name="image"
        defaultValue={settings.image as string | null}
        folder="quienes-somos"
        hint="Foto grande que acompaña el texto. Aspect ratio 4:3 recomendado."
      />

      <StringList
        label="Puntos destacados (con ícono)"
        name="features"
        defaultValue={Array.isArray(settings.features) ? (settings.features as string[]) : []}
        placeholder="Ej: Operadores y equipos certificados en todo el país"
        hint="Se muestran con un ícono debajo del texto. Máximo 3 (los íconos son fijos)."
      />

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
