import { partesResumenGruas } from '@/lib/agenda-view'

/** Línea de grúas para tarjetas: los nombres se recortan con "…" y el "+N" queda siempre visible, en cualquier ancho. */
export default function GruasResumen({
  ev,
  max = 2,
  sep,
  className = '',
}: {
  ev: { gruas?: { nombre: string }[]; grua?: { nombre: string } | null }
  max?: number
  sep?: string
  className?: string
}) {
  const { texto, resto } = partesResumenGruas(ev, max, sep)
  return (
    <span className={`flex min-w-0 items-baseline gap-[0.35em] ${className}`}>
      <span className="truncate">{texto}</span>
      {resto > 0 && <span className="shrink-0 font-semibold">+{resto}</span>}
    </span>
  )
}
