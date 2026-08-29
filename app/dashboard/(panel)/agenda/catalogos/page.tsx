import Link from 'next/link'
import { getGruas, getEmpresasAgenda, getOperarios } from '@/lib/agenda'
import { TIPOS_GRUA } from '@/lib/validations/agenda'
import {
  createGrua, updateGrua, toggleGrua, deleteGrua,
  createEmpresaAgenda, updateEmpresaAgenda, toggleEmpresaAgenda, deleteEmpresaAgenda,
  createOperario, updateOperario, toggleOperario, deleteOperario,
} from '@/app/actions/agenda'
import PageHeader from '@/components/dashboard/PageHeader'
import CatalogSection from './CatalogSection'
import { ArrowLeft } from 'lucide-react'

const TIPO_OPTIONS = TIPOS_GRUA.map((t) => ({ value: t, label: t }))

export default async function CatalogosAgendaPage() {
  const [gruas, empresas, operarios] = await Promise.all([
    getGruas({ includeInactive: true }),
    getEmpresasAgenda({ includeInactive: true }),
    getOperarios({ includeInactive: true }),
  ])

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link
          href="/dashboard/agenda"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={14} /> Volver a Agenda
        </Link>
      </div>

      <PageHeader title="Catálogos de Agenda" description="Grúas, empresas y operarios usados al cargar un evento." />

      <div className="space-y-6">
        <CatalogSection
          title="Grúas"
          items={gruas.map((g) => ({
            id: g.id,
            nombre: g.nombre,
            activo: g.activo,
            subtitle: [g.tipo, g.patente, g.capacidad_toneladas ? `${g.capacidad_toneladas} tn` : null].filter(Boolean).join(' · '),
            values: { nombre: g.nombre, patente: g.patente ?? '', capacidad_toneladas: g.capacidad_toneladas ?? '', tipo: g.tipo, foto_url: g.foto_url ?? '' },
          }))}
          fields={[
            { name: 'nombre', label: 'Nombre', placeholder: 'Ej: Grúa Terex 25 tn' },
            { name: 'tipo', label: 'Tipo', type: 'select', options: TIPO_OPTIONS },
            { name: 'patente', label: 'Patente', required: true, placeholder: 'Ej: AB123CD' },
            { name: 'capacidad_toneladas', label: 'Capacidad (tn)', type: 'number', required: true, placeholder: 'Ej: 25' },
            { name: 'foto_url', label: 'Foto', type: 'image', folder: 'grua-fotos' },
          ]}
          createAction={createGrua}
          updateAction={updateGrua}
          toggleAction={toggleGrua}
          deleteAction={deleteGrua}
        />

        <CatalogSection
          title="Empresas"
          items={empresas.map((e) => ({
            id: e.id,
            nombre: e.nombre,
            activo: e.activo,
            subtitle: [e.contacto, e.telefono].filter(Boolean).join(' · '),
            values: { nombre: e.nombre, contacto: e.contacto ?? '', telefono: e.telefono ?? '', notas: e.notas ?? '', logo_url: e.logo_url ?? '' },
          }))}
          fields={[
            { name: 'nombre', label: 'Nombre', placeholder: 'Ej: Constructora del Sur S.A.' },
            { name: 'contacto', label: 'Persona de contacto', required: true, placeholder: 'Ej: Juan Pérez' },
            { name: 'telefono', label: 'Teléfono', required: true, placeholder: 'Ej: 351 555-1234' },
            { name: 'notas', label: 'Notas', placeholder: 'Notas internas (opcional)' },
            { name: 'logo_url', label: 'Logo', type: 'image', folder: 'empresa-logos' },
          ]}
          createAction={createEmpresaAgenda}
          updateAction={updateEmpresaAgenda}
          toggleAction={toggleEmpresaAgenda}
          deleteAction={deleteEmpresaAgenda}
        />

        <CatalogSection
          title="Operarios"
          items={operarios.map((o) => ({
            id: o.id,
            nombre: o.nombre,
            activo: o.activo,
            subtitle: o.telefono ?? undefined,
            values: { nombre: o.nombre, telefono: o.telefono ?? '', foto_url: o.foto_url ?? '' },
          }))}
          fields={[
            { name: 'nombre', label: 'Nombre', placeholder: 'Ej: Carlos Gómez' },
            { name: 'telefono', label: 'Teléfono', required: true, placeholder: 'Ej: 351 555-1234' },
            { name: 'foto_url', label: 'Foto', type: 'image', folder: 'operario-fotos' },
          ]}
          createAction={createOperario}
          updateAction={updateOperario}
          toggleAction={toggleOperario}
          deleteAction={deleteOperario}
        />
      </div>
    </div>
  )
}
