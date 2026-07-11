'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import { TextField } from '@/components/dashboard/Field'
import SaveButton from '@/components/dashboard/SaveButton'
import ConfirmDialog from '@/components/dashboard/ConfirmDialog'
import { Trash2, Power, AlertCircle } from 'lucide-react'
import type { AgendaState } from '@/app/actions/agenda'

interface Item {
  id: string
  nombre: string
  activo: boolean
  subtitle?: string
}

interface FieldConfig {
  name: string
  label: string
  type?: string
  required?: boolean
}

interface Props {
  title: string
  items: Item[]
  fields: FieldConfig[]
  createAction: (prevState: unknown, formData: FormData) => Promise<AgendaState>
  toggleAction: (prevState: unknown, formData: FormData) => Promise<AgendaState>
  deleteAction: (prevState: unknown, formData: FormData) => Promise<AgendaState>
}

export default function CatalogSection({ title, items, fields, createAction, toggleAction, deleteAction }: Props) {
  const [createState, createFormAction] = useFormState(createAction, undefined)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; nombre: string } | null>(null)

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
      <h2 className="font-headline font-bold text-zinc-900 mb-4">{title}</h2>

      <div className="space-y-2 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 border border-zinc-100 rounded-lg px-3 py-2">
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
            <button
              type="button"
              onClick={() => setPendingDelete({ id: item.id, nombre: item.nombre })}
              className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
              aria-label="Eliminar"
            >
              <Trash2 size={14} />
            </button>
          </div>
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
        {fields.map((f) => (
          <TextField key={f.name} label={f.label} name={f.name} type={f.type} required={f.required} />
        ))}
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
