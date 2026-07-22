'use client'

import { useState } from 'react'
import { fieldLabel } from './Field'

interface Props {
  label: string
  colsName: string
  rowsName: string
  maxCols: number
  maxRows: number
  defaultCols?: number
  defaultRows?: number
  hint?: string
}

/**
 * Grilla clickeable tipo bento: mostrar en cuadraditos cuánto espacio ocupa una
 * imagen (en vez de un <select> con texto "2 columnas") para que quede claro
 * de un vistazo qué es fila y qué es columna, y qué queda vacío alrededor.
 */
export default function SpanPicker({
  label,
  colsName,
  rowsName,
  maxCols,
  maxRows,
  defaultCols = 1,
  defaultRows = 1,
  hint,
}: Props) {
  const [cols, setCols] = useState(defaultCols)
  const [rows, setRows] = useState(defaultRows)

  return (
    <div>
      <label className={fieldLabel}>{label}</label>
      <input type="hidden" name={colsName} value={cols} />
      <input type="hidden" name={rowsName} value={rows} />

      <div
        className="inline-grid gap-1 p-2 bg-zinc-50 rounded-lg border border-zinc-200"
        style={{ gridTemplateColumns: `repeat(${maxCols}, 1.75rem)` }}
      >
        {Array.from({ length: maxRows }).map((_, r) =>
          Array.from({ length: maxCols }).map((_, c) => {
            const occupied = c < cols && r < rows
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => {
                  setCols(c + 1)
                  setRows(r + 1)
                }}
                aria-label={`${c + 1} columna(s) × ${r + 1} fila(s)`}
                className={`w-7 h-7 rounded transition-colors ${
                  occupied
                    ? 'bg-igb-yellow border border-igb-yellow-dark/40'
                    : 'bg-white border border-zinc-200 hover:border-igb-yellow/40'
                }`}
              />
            )
          }),
        )}
      </div>
      <p className="text-xs text-zinc-500 mt-1.5">
        {cols} columna{cols > 1 ? 's' : ''} × {rows} fila{rows > 1 ? 's' : ''}
      </p>
      {hint && <p className="text-zinc-400 text-xs mt-1">{hint}</p>}
    </div>
  )
}
