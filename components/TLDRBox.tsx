import { ListChecks } from 'lucide-react'

interface TLDRBoxProps {
  items: string[]
  heading?: string
  className?: string
}

/** Caja de "puntos clave" arriba de contenido largo — TL:DR / key takeaways. */
export default function TLDRBox({ items, heading = 'En resumen', className }: TLDRBoxProps) {
  if (items.length === 0) return null

  return (
    <div
      className={
        className ??
        'mb-10 rounded-xl border border-igb-outline/60 bg-igb-surface-low p-6'
      }
      data-animate="fade-up"
    >
      <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-igb-yellow-dark">
        <ListChecks size={16} aria-hidden="true" /> {heading}
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-igb-on-surface">
            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-igb-yellow-dark" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
