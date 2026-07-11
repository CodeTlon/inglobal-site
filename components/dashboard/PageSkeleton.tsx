import { Skeleton } from '@/components/ui/skeleton'

/** Placeholder genérico para las secciones del panel (`loading.tsx` de cada segmento):
 * imita la forma de `PageHeader` + una lista/form debajo mientras carga la data real. */
export default function PageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Cargando contenido">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
      <span className="sr-only">Cargando contenido…</span>
    </div>
  )
}
