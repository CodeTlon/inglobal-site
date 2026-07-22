import { cn } from '@/lib/utils'

// shadcn/ui Skeleton, adaptado a los tokens propios de InGlobal
// (bg-igb-surface-high en vez de bg-muted — este proyecto no usa el
// theming de CSS vars de shadcn, solo Tailwind + tokens custom).
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-igb-surface-high', className)}
      {...props}
    />
  )
}

export { Skeleton }
