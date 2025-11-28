'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-16 rounded-2xl bg-white/10 sm:h-20" />
      ))}
    </div>
  )
}

export function DetailsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4 rounded bg-white/10" />
      <Skeleton className="h-4 w-1/2 rounded bg-white/10" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-4 rounded bg-white/10" />
        ))}
      </div>
      <Skeleton className="h-24 rounded-2xl bg-white/10" />
    </div>
  )
}
