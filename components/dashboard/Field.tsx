'use client'

import { useEffect, useRef, useState } from 'react'
import { Trash2, Plus, Upload, Loader2, Image as ImageIcon, Video as VideoIcon, FileText } from 'lucide-react'
import { uploadMediaAction, deleteMediaAction } from '@/app/actions/settings'

// Shared class strings — keep dashboard styling in one place
export const fieldLabel =
  'block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5'
export const fieldInput =
  'w-full bg-white border border-zinc-200 rounded-md px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-igb-yellow/50 focus:border-igb-yellow-dark transition-colors'

// ─── TextField ──────────────────────────────────────────────────────────────

export function TextField({
  label,
  name,
  defaultValue,
  type = 'text',
  hint,
  required,
  placeholder,
  min,
  max,
}: {
  label: string
  name: string
  defaultValue?: string
  type?: string
  hint?: string
  required?: boolean
  placeholder?: string
  min?: string
  max?: string
}) {
  return (
    <div>
      <label htmlFor={name} className={fieldLabel}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ''}
        required={required}
        placeholder={placeholder}
        min={min}
        max={max}
        className={fieldInput}
      />
      {hint && <p className="text-zinc-400 text-xs mt-1.5">{hint}</p>}
    </div>
  )
}

// ─── TextArea ───────────────────────────────────────────────────────────────

export function TextArea({
  label,
  name,
  defaultValue,
  rows = 4,
  hint,
  placeholder,
}: {
  label: string
  name: string
  defaultValue?: string
  rows?: number
  hint?: string
  placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={name} className={fieldLabel}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        className={`${fieldInput} resize-y`}
      />
      {hint && <p className="text-zinc-400 text-xs mt-1.5">{hint}</p>}
    </div>
  )
}

// ─── NumberField ─────────────────────────────────────────────────────────────

export function NumberField({
  label,
  name,
  defaultValue,
  hint,
  min,
  max,
}: {
  label: string
  name: string
  defaultValue?: number
  hint?: string
  min?: number
  max?: number
}) {
  return (
    <div>
      <label htmlFor={name} className={fieldLabel}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="number"
        defaultValue={defaultValue ?? ''}
        min={min}
        max={max}
        className={fieldInput}
      />
      {hint && <p className="text-zinc-400 text-xs mt-1.5">{hint}</p>}
    </div>
  )
}

// ─── SelectField ─────────────────────────────────────────────────────────

export function SelectField({
  label,
  name,
  defaultValue,
  options,
  hint,
  placeholder,
}: {
  label: string
  name: string
  defaultValue?: number | string
  options: { value: number | string; label: string }[]
  hint?: string
  placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={name} className={fieldLabel}>
        {label}
      </label>
      <select id={name} name={name} defaultValue={defaultValue ?? ''} className={fieldInput}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && <p className="text-zinc-400 text-xs mt-1.5">{hint}</p>}
    </div>
  )
}

// ─── ImageUpload ─────────────────────────────────────────────────────────────
// Calca el patrón de gc2/src/components/dashboard/Field.tsx:
// - hidden input with `name` carries the URL to the parent form
// - file input auto-uploads on pick via uploadMediaAction (shows busy state)
// - sends oldUrl to let the backend delete the previous file
// - text input allows manual URL entry

export function ImageUpload({
  label,
  name,
  defaultValue,
  folder = 'uploads',
  hint,
  focalName,
  focalDefaultValue,
}: {
  label: string
  name: string
  defaultValue?: string | null
  folder?: string
  hint?: string
  /** Si se pasa, agrega un picker de foco: click sobre el preview elige qué parte de la imagen se prioriza al recortar. */
  focalName?: string
  focalDefaultValue?: string | null
}) {
  const [url, setUrl] = useState<string>(defaultValue ?? '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [focal, setFocal] = useState<string>(focalDefaultValue ?? '50% 50%')
  const objectUrlRef = useRef<string | null>(null)
  const genRef = useRef(0)

  function onPickFocal(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    setFocal(`${x}% ${y}%`)
  }

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Contador de generación: si el usuario elige otro archivo antes de que
    // termine este upload, la respuesta de este pick queda obsoleta y no debe
    // pisar el preview del pick más nuevo.
    const myGen = ++genRef.current
    const previousUrl = url
    const localPreview = URL.createObjectURL(file)
    objectUrlRef.current = localPreview
    setUrl(localPreview)
    setBusy(true)
    setErr(null)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)
    if (previousUrl) fd.append('oldUrl', previousUrl)
    const res = await uploadMediaAction(fd)
    URL.revokeObjectURL(localPreview)
    if (myGen !== genRef.current) return
    setBusy(false)
    objectUrlRef.current = null
    if (res.error) {
      setErr(res.error)
      setUrl(previousUrl)
      return
    }
    if (res.url) setUrl(res.url)
    e.target.value = ''
  }

  return (
    <div>
      <label className={fieldLabel}>{label}</label>
      {/* Hidden input carries URL to parent form on submit */}
      <input type="hidden" name={name} value={url} />
      {focalName && <input type="hidden" name={focalName} value={focal} />}

      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        {/* Preview thumbnail */}
        <div
          className={`relative flex-shrink-0 w-full sm:w-32 h-24 rounded-lg border border-zinc-200 overflow-hidden flex items-center justify-center bg-zinc-50 ${
            focalName && url ? 'cursor-crosshair' : ''
          }`}
          onClick={focalName && url ? onPickFocal : undefined}
        >
          {url ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover pointer-events-none"
                style={focalName ? { objectPosition: focal } : undefined}
              />
              {focalName && (
                <span
                  className="absolute w-3 h-3 rounded-full border-2 border-igb-yellow bg-igb-yellow/60 shadow -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ left: focal.split(' ')[0], top: focal.split(' ')[1] }}
                />
              )}
            </>
          ) : (
            <ImageIcon size={20} className="text-zinc-300" />
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL de la imagen, o subí un archivo"
            className={fieldInput}
          />
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-bold cursor-pointer transition-colors bg-igb-yellow/10 text-igb-yellow-dark border border-igb-yellow/30 hover:bg-igb-yellow/20">
              {busy ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Upload size={14} />
              )}
              {busy ? 'Subiendo…' : 'Subir archivo'}
              <input
                type="file"
                accept="image/*"
                onChange={onPick}
                disabled={busy}
                className="hidden"
              />
            </label>
            {url && (
              <button
                type="button"
                onClick={() => {
                  deleteMediaAction(url)
                  setUrl('')
                }}
                className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                Quitar
              </button>
            )}
          </div>
          {err && <p className="text-xs text-red-500">{err}</p>}
          {focalName && url && (
            <p className="text-zinc-400 text-xs">Clic sobre la miniatura para elegir qué parte de la foto se prioriza al recortar.</p>
          )}
        </div>
      </div>

      {hint && <p className="text-zinc-400 text-xs mt-1.5">{hint}</p>}
    </div>
  )
}

// ─── VideoUpload ─────────────────────────────────────────────────────────────
// Mismo patrón que ImageUpload pero acepta video/mp4 y usa <video> de preview.
// Sin resize en backend (el backend recibe el archivo tal como llega).

export function VideoUpload({
  label,
  name,
  defaultValue,
  folder = 'videos',
  hint,
}: {
  label: string
  name: string
  defaultValue?: string | null
  folder?: string
  hint?: string
}) {
  const [url, setUrl] = useState<string>(defaultValue ?? '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [previewBroken, setPreviewBroken] = useState(false)
  const objectUrlRef = useRef<string | null>(null)
  const genRef = useRef(0)

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const myGen = ++genRef.current
    const previousUrl = url
    const localPreview = URL.createObjectURL(file)
    objectUrlRef.current = localPreview
    setUrl(localPreview)
    setPreviewBroken(false)
    setBusy(true)
    setErr(null)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)
    if (previousUrl) fd.append('oldUrl', previousUrl)
    const res = await uploadMediaAction(fd)
    URL.revokeObjectURL(localPreview)
    if (myGen !== genRef.current) return
    setBusy(false)
    objectUrlRef.current = null
    if (res.error) {
      setErr(res.error)
      setUrl(previousUrl)
      return
    }
    if (res.url) setUrl(res.url)
    e.target.value = ''
  }

  return (
    <div>
      <label className={fieldLabel}>{label}</label>
      <input type="hidden" name={name} value={url} />

      <div className="flex flex-col gap-3">
        {/* Video preview or placeholder */}
        {url && !previewBroken ? (
          <div className="rounded-lg overflow-hidden border border-zinc-200 bg-zinc-900 aspect-video">
            <video
              src={url}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
              onError={() => setPreviewBroken(true)}
            />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 h-32 flex flex-col items-center justify-center gap-2">
            <VideoIcon size={24} className="text-zinc-300" />
            <span className="text-xs text-zinc-400">Sin video</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setPreviewBroken(false) }}
            placeholder="URL del video, o subí un archivo MP4"
            className={fieldInput}
          />
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-bold cursor-pointer transition-colors bg-igb-yellow/10 text-igb-yellow-dark border border-igb-yellow/30 hover:bg-igb-yellow/20">
              {busy ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Upload size={14} />
              )}
              {busy ? 'Subiendo…' : 'Subir MP4'}
              <input
                type="file"
                accept="video/mp4"
                onChange={onPick}
                disabled={busy}
                className="hidden"
              />
            </label>
            {url && (
              <button
                type="button"
                onClick={() => {
                  deleteMediaAction(url)
                  setUrl('')
                }}
                className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                Quitar
              </button>
            )}
          </div>
          {err && <p className="text-xs text-red-500">{err}</p>}
        </div>
      </div>

      {hint && <p className="text-zinc-400 text-xs mt-1.5">{hint}</p>}
    </div>
  )
}

// ─── FileUpload ──────────────────────────────────────────────────────────────
// Adjuntos genéricos (PDF). Mismo patrón que ImageUpload/VideoUpload pero sin
// preview visual — solo nombre de archivo + link "Ver PDF".

export function FileUpload({
  label,
  name,
  defaultValue,
  folder = 'documentos',
  hint,
}: {
  label: string
  name: string
  defaultValue?: string | null
  folder?: string
  hint?: string
}) {
  const [url, setUrl] = useState<string>(defaultValue ?? '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setErr(null)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)
    if (url) fd.append('oldUrl', url)
    const res = await uploadMediaAction(fd)
    setBusy(false)
    if (res.error) {
      setErr(res.error)
      return
    }
    if (res.url) setUrl(res.url)
    e.target.value = ''
  }

  const fileName = url ? decodeURIComponent(url.split('/').pop() ?? '') : ''

  return (
    <div>
      <label className={fieldLabel}>{label}</label>
      <input type="hidden" name={name} value={url} />

      <div className="flex items-center gap-3">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-bold bg-zinc-50 border border-zinc-200 text-zinc-700 hover:text-igb-yellow-dark hover:border-igb-yellow/40 transition-colors truncate max-w-[220px]"
          >
            <FileText size={14} className="flex-shrink-0" />
            <span className="truncate">{fileName}</span>
          </a>
        ) : (
          <span className="inline-flex items-center gap-2 text-xs text-zinc-400">
            <FileText size={14} /> Sin adjunto
          </span>
        )}

        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-bold cursor-pointer transition-colors bg-igb-yellow/10 text-igb-yellow-dark border border-igb-yellow/30 hover:bg-igb-yellow/20">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {busy ? 'Subiendo…' : url ? 'Reemplazar' : 'Subir PDF'}
          <input
            type="file"
            accept="application/pdf"
            onChange={onPick}
            disabled={busy}
            className="hidden"
          />
        </label>

        {url && (
          <button
            type="button"
            onClick={() => {
              deleteMediaAction(url)
              setUrl('')
            }}
            className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            Quitar
          </button>
        )}
      </div>
      {err && <p className="text-xs text-red-500 mt-1.5">{err}</p>}
      {hint && <p className="text-zinc-400 text-xs mt-1.5">{hint}</p>}
    </div>
  )
}

// ─── StringList ──────────────────────────────────────────────────────────────
// Editable list of strings. Serializes as JSON in hidden input.

export function StringList({
  label,
  name,
  defaultValue,
  placeholder,
  hint,
}: {
  label: string
  name: string
  defaultValue?: string[]
  placeholder?: string
  hint?: string
}) {
  const [items, setItems] = useState<string[]>(
    defaultValue?.length ? defaultValue : ['']
  )

  return (
    <div>
      <label className={fieldLabel}>{label}</label>
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(items.filter((s) => s.trim()))}
      />
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={it}
              onChange={(e) => {
                const copy = [...items]
                copy[i] = e.target.value
                setItems(copy)
              }}
              placeholder={placeholder}
              className={fieldInput}
            />
            <button
              type="button"
              onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              className="px-3 rounded-md text-zinc-400 hover:text-red-500 border border-zinc-200 transition-colors"
              aria-label="Quitar"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setItems([...items, ''])}
        className="mt-2 inline-flex items-center gap-2 text-xs text-igb-yellow-dark hover:text-igb-on-surface transition-colors font-bold"
      >
        <Plus size={14} /> Agregar
      </button>
      {hint && <p className="text-zinc-400 text-xs mt-1.5">{hint}</p>}
    </div>
  )
}

// ─── CheckboxGroup ───────────────────────────────────────────────────────────
// Multi-select de IDs (ej: operarios asignados a un evento). Serializa como JSON.

export function CheckboxGroup({
  label,
  name,
  options,
  defaultValue,
  hint,
}: {
  label: string
  name: string
  options: { value: string; label: string }[]
  defaultValue?: string[]
  hint?: string
}) {
  const [selected, setSelected] = useState<string[]>(defaultValue ?? [])

  function toggle(value: string) {
    setSelected((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  return (
    <div>
      <label className={fieldLabel}>{label}</label>
      <input type="hidden" name={name} value={JSON.stringify(selected)} />
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-colors ${
              selected.includes(opt.value)
                ? 'bg-igb-yellow text-igb-on-yellow border-igb-yellow'
                : 'bg-white text-zinc-500 border-zinc-200 hover:border-igb-yellow-dark/40'
            }`}
          >
            {opt.label}
          </button>
        ))}
        {options.length === 0 && (
          <p className="text-xs text-zinc-400">No hay operarios activos cargados en el catálogo.</p>
        )}
      </div>
      {hint && <p className="text-zinc-400 text-xs mt-1.5">{hint}</p>}
    </div>
  )
}

// ─── Checkbox ────────────────────────────────────────────────────────────────

export function Checkbox({
  label,
  name,
  defaultChecked,
  hint,
}: {
  label: string
  name: string
  defaultChecked?: boolean
  hint?: string
}) {
  return (
    <div>
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="w-4 h-4 rounded accent-igb-yellow"
        />
        <span className="text-sm font-bold text-zinc-700">{label}</span>
      </label>
      {hint && <p className="text-zinc-400 text-xs mt-1.5 ml-6">{hint}</p>}
    </div>
  )
}

// ─── StatsList ───────────────────────────────────────────────────────────────
// Lista de stats del hero [{number, label}]. Serializa como JSON.

type StatItem = { number: string; label: string }

export function StatsList({
  label,
  name,
  defaultValue,
  hint,
}: {
  label: string
  name: string
  defaultValue?: StatItem[]
  hint?: string
}) {
  const [items, setItems] = useState<StatItem[]>(
    defaultValue?.length
      ? defaultValue
      : [{ number: '', label: '' }]
  )

  function update(i: number, key: keyof StatItem, val: string) {
    setItems(items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)))
  }

  return (
    <div>
      <label className={fieldLabel}>{label}</label>
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(items.filter((s) => s.number.trim() || s.label.trim()))}
      />
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <input
                type="text"
                value={it.number}
                onChange={(e) => update(i, 'number', e.target.value)}
                placeholder="Número (ej: 40+)"
                className={fieldInput}
              />
              <input
                type="text"
                value={it.label}
                onChange={(e) => update(i, 'label', e.target.value)}
                placeholder="Etiqueta (ej: Años de experiencia)"
                className={fieldInput}
              />
            </div>
            <button
              type="button"
              onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              className="mt-0.5 px-3 py-2.5 rounded-md text-zinc-400 hover:text-red-500 border border-zinc-200 transition-colors"
              aria-label="Quitar"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setItems([...items, { number: '', label: '' }])}
        className="mt-2 inline-flex items-center gap-2 text-xs text-igb-yellow-dark hover:text-igb-on-surface transition-colors font-bold"
      >
        <Plus size={14} /> Agregar stat
      </button>
      {hint && <p className="text-zinc-400 text-xs mt-1.5">{hint}</p>}
    </div>
  )
}

// ─── LinkList ────────────────────────────────────────────────────────────────
// Lista de links [{href, label}] (ej: accesos rápidos del dashboard). Serializa como JSON.

type LinkItem = { href: string; label: string }

export function LinkList({
  label,
  name,
  defaultValue,
  hint,
}: {
  label: string
  name: string
  defaultValue?: LinkItem[]
  hint?: string
}) {
  const [items, setItems] = useState<LinkItem[]>(
    defaultValue?.length ? defaultValue : [{ href: '', label: '' }]
  )

  function update(i: number, key: keyof LinkItem, val: string) {
    setItems(items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)))
  }

  return (
    <div>
      <label className={fieldLabel}>{label}</label>
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(items.filter((l) => l.href.trim() && l.label.trim()))}
      />
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <input
                type="text"
                value={it.label}
                onChange={(e) => update(i, 'label', e.target.value)}
                placeholder="Etiqueta (ej: Nuevo Montaje)"
                className={fieldInput}
              />
              <input
                type="text"
                value={it.href}
                onChange={(e) => update(i, 'href', e.target.value)}
                placeholder="Ruta (ej: /dashboard/montajes/nuevo)"
                className={fieldInput}
              />
            </div>
            <button
              type="button"
              onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              className="mt-0.5 px-3 py-2.5 rounded-md text-zinc-400 hover:text-red-500 border border-zinc-200 transition-colors"
              aria-label="Quitar"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setItems([...items, { href: '', label: '' }])}
        className="mt-2 inline-flex items-center gap-2 text-xs text-igb-yellow-dark hover:text-igb-on-surface transition-colors font-bold"
      >
        <Plus size={14} /> Agregar acceso
      </button>
      {hint && <p className="text-zinc-400 text-xs mt-1.5">{hint}</p>}
    </div>
  )
}
