import Link from 'next/link'
import { getGruas, getEmpresasAgenda, getOperarios } from '@/lib/agenda'
import {
  createGrua, toggleGrua, deleteGrua,
  createEmpresaAgenda, toggleEmpresaAgenda, deleteEmpresaAgenda,
  createOperario, toggleOperario, deleteOperario,
} from '@/app/actions/agenda'
import PageHeader from '@/components/dashboard/PageHeader'
import CatalogSection from './CatalogSection'
import { ArrowLeft } from 'lucide-react'

export default async function CatalogosAgendaPage() {
  const [gruas, empresas, operarios] = await Promise.all([
    getGruas({ includeInactive: true }),
    getEmpresasAgenda({ includeInactive: true }),
    getOperarios({ includeInactive: true }),
  ])

  return (
    <div className="max-w-2xl">
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
            subtitle: [g.patente, g.capacidad_toneladas ? `${g.capacidad_toneladas} tn` : null].filter(Boolean).join(' · '),
          }))}
          fields={[
            { name: 'nombre', label: 'Nombre' },
            { name: 'patente', label: 'Patente' },
            { name: 'capacidad_toneladas', label: 'Capacidad (tn)', type: 'number' },
          ]}
          createAction={createGrua}
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
          }))}
          fields={[
            { name: 'nombre', label: 'Nombre' },
            { name: 'contacto', label: 'Contacto' },
            { name: 'telefono', label: 'Teléfono' },
          ]}
          createAction={createEmpresaAgenda}
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
          }))}
          fields={[
            { name: 'nombre', label: 'Nombre' },
            { name: 'telefono', label: 'Teléfono' },
          ]}
          createAction={createOperario}
          toggleAction={toggleOperario}
          deleteAction={deleteOperario}
        />
      </div>
    </div>
  )
}
