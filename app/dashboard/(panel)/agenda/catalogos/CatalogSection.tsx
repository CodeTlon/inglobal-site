'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import { TextField, SelectField } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import ConfirmDialog from '@/components/dashboard/ConfirmDialog'
import { Trash2, Power, AlertCircle, Pencil, X } from 'lucide-react'
import type { AgendaState } from '@/app/actions/agenda'

interface Item {
  id: string
  nombre: string
  activo: boolean
  subtitle?: string
  values?: Record<string, string | number>
}

interface FieldConfig {
  name: string
  label: string
  type?: string
  required?: boolean
  options?: { value: string; label: string }[]
}

interface Props {
  title: string
  items: Item[]
  fields: FieldConfig[]
  createAction: (prevState: unknown, formData: FormData) => Promise<AgendaState>
  updateAction?: (prevState: unknown, formData: FormData) => Promise<AgendaState>
  toggleAction: (prevState: unknown, formData: FormData) => Promise<AgendaState>
  deleteAction: (prevState: unknown, formData: FormData) => Promise<AgendaState>
}

function FieldInputs({ fields, values }: { fields: FieldConfig[]; values?: Record<string, string | number> }) {
  return (
    <>
      {fields.map((f) =>
        f.type === 'select' ? (
          <SelectField
            key={f.name}
            label={f.label}
            name={f.name}
            defaultValue={values?.[f.name]}
            options={f.options ?? []}
          />
        ) : (
          <TextField
            key={f.name}
            label={f.label}
            name={f.name}
            type={f.type}
            required={f.required}
            defaultValue={values?.[f.name] !== undefined ? String(values[f.name]) : undefined}
          />
        ),
      )}
    </>
  )
}

function CatalogRow({
  item,
  fields,
  toggleAction,
  updateAction,
  onRequestDelete,
}: {
  item: Item
  fields: FieldConfig[]
  toggleAction: Props['toggleAction']
  updateAction?: Props['updateAction']
  onRequestDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [updateState, updateFormAction] = useFormState(updateAction ?? (async () => undefined), undefined)

  if (editing && updateAction) {
    return (
      <div className="border border-igb-yellow/40 bg-igb-yellow/5 rounded-lg px-3 py-3">
        {updateState?.error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-xs">{updateState.error}</p>
          </div>
        )}
        <form action={updateFormAction} className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
          <input type="hidden" name="id" value={item.id} />
          <FieldInputs fields={fields} values={item.values} />
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-md text-xs font-bold text-zinc-500 hover:bg-zinc-100 transition-colors"
            >
              <X size={14} /> Cancelar
            </button>
            <SaveButton />
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 border border-zinc-100 rounded-lg px-3 py-2">
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold truncate ${item.activo ? 'text-zinc-900' : 'text-zinc-400 line-through'}`}>{item.nombre}</p>
        {item.subtitle && <p className="text-xs text-zinc-400 truncate">{item.subtitle}</p>}
      </div>
      <form action={async (formData) => { await toggleAction(undefined, formData) }}>
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="activo" value={String(item.activo)} />
        <button
          type="submit"
          className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded transition-colors ${
            item.activo ? 'bg-igb-yellow/15 text-igb-yellow-dark' : 'bg-zinc-100 text-zinc-400'
          }`}
        >
          <Power size={12} /> {item.activo ? 'Activo' : 'Inactivo'}
        </button>
      </form>
      {updateAction && (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="p-1.5 text-zinc-400 hover:text-igb-yellow-dark transition-colors"
          aria-label="Editar"
        >
          <Pencil size={14} />
        </button>
      )}
      <button
        type="button"
        onClick={onRequestDelete}
        className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
        aria-label="Eliminar"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

export default function CatalogSection({ title, items, fields, createAction, updateAction, toggleAction, deleteAction }: Props) {
  const [createState, createFormAction] = useFormState(createAction, undefined)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; nombre: string } | null>(null)

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
      <h2 className="font-headline font-bold text-zinc-900 mb-4">{title}</h2>

      <div className="space-y-2 mb-6">
        {items.map((item) => (
          <CatalogRow
            key={item.id}
            item={item}
            fields={fields}
            toggleAction={toggleAction}
            updateAction={updateAction}
            onRequestDelete={() => setPendingDelete({ id: item.id, nombre: item.nombre })}
          />
        ))}
        {items.length === 0 && <p className="text-xs text-zinc-400">Sin registros.</p>}
      </div>

      {createState?.error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-xs">{createState.error}</p>
        </div>
      )}

      <form action={createFormAction} className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
        <FieldInputs fields={fields} />
        <div className="sm:col-span-2 flex justify-end">
          <SaveButton />
        </div>
      </form>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Eliminar registro"
        message={pendingDelete ? `¿Eliminar "${pendingDelete.nombre}"? Esta acción no se puede deshacer.` : ''}
        confirmLabel="Eliminar"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return
          const fd = new FormData()
          fd.append('id', pendingDelete.id)
          deleteAction(undefined, fd)
          setPendingDelete(null)
        }}
      />
    </div>
  )
}
