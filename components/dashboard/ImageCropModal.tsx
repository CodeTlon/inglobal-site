'use client'

import { useCallback, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', reject)
    img.src = src
  })
}

// Patrón de referencia de react-easy-crop: se rota sobre un canvas cuadrado
// de lado 2x el tamaño original (para que no se pierdan las esquinas al
// rotar) y después se recorta el área elegida sobre ese canvas ya rotado.
async function getCroppedBlob(imageSrc: string, area: Area, rotationDeg: number): Promise<Blob> {
  const image = await loadImage(imageSrc)
  const radians = (rotationDeg * Math.PI) / 180
  const safeSize = Math.max(image.width, image.height) * 2

  const rotCanvas = document.createElement('canvas')
  rotCanvas.width = safeSize
  rotCanvas.height = safeSize
  const rotCtx = rotCanvas.getContext('2d')
  if (!rotCtx) throw new Error('No se pudo procesar la imagen.')
  rotCtx.translate(safeSize / 2, safeSize / 2)
  rotCtx.rotate(radians)
  rotCtx.translate(-safeSize / 2, -safeSize / 2)
  rotCtx.drawImage(image, (safeSize - image.width) / 2, (safeSize - image.height) / 2)

  const outCanvas = document.createElement('canvas')
  outCanvas.width = area.width
  outCanvas.height = area.height
  const outCtx = outCanvas.getContext('2d')
  if (!outCtx) throw new Error('No se pudo procesar la imagen.')
  outCtx.drawImage(
    rotCanvas,
    (safeSize - image.width) / 2 + area.x,
    (safeSize - image.height) / 2 + area.y,
    area.width,
    area.height,
    0,
    0,
    area.width,
    area.height,
  )

  return new Promise((resolve, reject) => {
    outCanvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo procesar la imagen.'))), 'image/jpeg', 0.92)
  })
}

/**
 * Modal estándar de "subiste una foto, ahora encuadrala" — arrastrar para
 * mover, zoom y rotación con sliders. `aspect` fijo (1 = cuadrado/círculo
 * para avatares, otros valores para banners tipo hero).
 */
export default function ImageCropModal({
  file,
  aspect,
  round,
  onCancel,
  onConfirm,
}: {
  file: File
  aspect: number
  round?: boolean
  onCancel: () => void
  onConfirm: (file: File) => void
}) {
  const [imageSrc] = useState(() => URL.createObjectURL(file))
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [area, setArea] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setArea(croppedAreaPixels)
  }, [])

  async function handleConfirm() {
    if (!area) return
    setBusy(true)
    setError(null)
    try {
      const blob = await getCroppedBlob(imageSrc, area, rotation)
      const name = file.name.replace(/\.\w+$/, '') + '.jpg'
      onConfirm(new File([blob], name, { type: 'image/jpeg' }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo procesar la imagen.')
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[300] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-xl">
        <div className="relative w-full h-80 bg-zinc-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            cropShape={round ? 'round' : 'rect'}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">Rotación</label>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-zinc-200 rounded-lg py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={busy || !area}
              className="flex-1 bg-igb-navy text-white rounded-lg py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {busy ? 'Aplicando…' : 'Listo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
