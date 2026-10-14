'use client'

import { useState } from 'react'
import ConfirmDialog from '@/components/dashboard/ConfirmDialog'
import InlineSavedBanner from '@/components/dashboard/InlineSavedBanner'
import { AlertCircle, Loader2, RotateCcw, Trash2 } from 'lucide-react'
import type { AgendaState } from '@/app/actions/agenda'

interface Item {
  id: string
  nombre: string
  subtitle?: string
}

interface Props {
  items: Item[]
  reincorporarAction: (prevState: unknown, formData: FormData) => Promise<AgendaState>
  deleteAction: (prevState: unknown, formData: FormData) => Promise<AgendaState>
}

// Ex operarios = baja lógica (eliminado_at). Se conservan para el historial de
// eventos. Reincorporar los devuelve a Operarios como INACTIVOS; el borrado
// definitivo solo prospera si no tienen eventos asociados (lo valida el servidor).
export default function ExOperariosSection({ items, reincorporarAction, deleteAction }: Props) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<{ success?: boolean } | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Item | null>(null)

  async function run(action: Props['deleteAction'], id: string) {
    setBusyId(id)
    setError(null)
    const fd = new FormData()
    fd.append('id', id)
    const res = await action(undefined, fd)
    setBusyId(null)
    if (res?.error) setError(res.error)
    else setSaved({ success: true })
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    const id = pendingDelete.id
    setPendingDelete(null)
    await run(deleteAction, id)
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
      <h2 className="font-headline font-bold text-zinc-900 mb-1">Ex operarios</h2>
      <p className="text-xs text-zinc-500 mb-4">
        Operarios dados de baja. Siguen apareciendo en el historial de eventos. Al reincorporarlos vuelven como inactivos.
      </p>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-4" role="alert">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-xs">{error}</p>
        </div>
      )}
      <InlineSavedBanner trigger={saved} />

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 border border-zinc-100 rounded-lg px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-zinc-500 truncate">{item.nombre}</p>
              {item.subtitle && <p className="text-xs text-zinc-400 truncate">{item.subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={() => run(reincorporarAction, item.id)}
              disabled={busyId !== null}
              className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-igb-yellow/15 text-igb-yellow-dark transition-colors disabled:opacity-60"
            >
              {busyId === item.id ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
              Reincorporar
            </button>
            <button
              type="button"
              onClick={() => setPendingDelete(item)}
              disabled={busyId !== null}
              className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-60"
              aria-label={`Eliminar definitivamente a ${item.nombre}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-zinc-400">No hay ex operarios.</p>}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Eliminar definitivamente"
        message={
          pendingDelete
            ? `¿Eliminar definitivamente a "${pendingDelete.nombre}"? Solo es posible si no tiene eventos en el historial. Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
