import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-white/5', className)}
      {...props}
    />
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-app-line bg-app-surface p-6 space-y-4">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-48" />
    </div>
  )
}

function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-lg"
            style={{ height: `${((i * 17) % 80) + 20}px` }}
          />
        ))}
      </div>
    </div>
  )
}

export { Skeleton, CardSkeleton, TableSkeleton, ChartSkeleton }
