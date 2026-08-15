'use client'

import { useFormState } from 'react-dom'
import { updateSiteSettings } from '@/app/actions/settings'
import { TextField, TextArea, ImageUpload } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import { AlertCircle } from 'lucide-react'
import InlineSavedBanner from '@/components/dashboard/InlineSavedBanner'

const action = updateSiteSettings.bind(null, 'home_gallery')

// Mismo orden y span fijo que GALLERY_SPANS en app/page.tsx — la tile 1 es la
// grande (2x2), el resto son iguales.
const ITEMS = [
  { i: 1, hint: 'Tile grande (ocupa 2x2 en el mosaico).' },
  { i: 2, hint: undefined },
  { i: 3, hint: undefined },
  { i: 4, hint: undefined },
  { i: 5, hint: undefined },
]

export default function HomeGalleryForm({ settings }: { settings: Record<string, unknown> }) {
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

      <TextField label="Label (etiqueta)" name="label" defaultValue={settings.label as string} placeholder="Nuestro Trabajo" />
      <TextField label="Título (h2)" name="heading" defaultValue={settings.heading as string} placeholder="Proyectos que nos definen" />
      <TextArea
        label="Subtítulo"
        name="subheading"
        defaultValue={settings.subheading as string}
        rows={2}
        placeholder="Visualizá la magnitud de nuestras operaciones en sectores industrial, energético e infraestructura."
      />
      <TextField label="Texto del link" name="link_text" defaultValue={settings.link_text as string} placeholder="Ver galería completa" />

      <div className="space-y-6 border-t border-zinc-200 pt-6">
        {ITEMS.map(({ i, hint }) => (
          <div key={i} className="space-y-3 bg-zinc-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-zinc-700">Foto {i}</p>
            <ImageUpload
              label={`Imagen ${i}`}
              name={`item${i}_src`}
              defaultValue={settings[`item${i}_src`] as string}
              folder="home-gallery"
              hint={hint}
            />
            <TextField label="Texto sobre la foto" name={`item${i}_label`} defaultValue={settings[`item${i}_label`] as string} placeholder="Izaje Industrial" />
            <TextField label="Texto alternativo (accesibilidad)" name={`item${i}_alt`} defaultValue={settings[`item${i}_alt`] as string} placeholder="Grúa telescópica en operación" />
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <SaveButton />
      </div>
    </form>
  )
}
