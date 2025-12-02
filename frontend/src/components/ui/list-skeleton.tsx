'use client'

import { Skeleton } from '@/components/ui/skeleton'

// Shared skeleton component for list items (agents/voices)
export function ListItemSkeleton({ variant = 'table' }: { variant?: 'table' | 'card' }) {
  if (variant === 'card') {
    return (
      <div className="border border-gray-200 dark:border-gray-900 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 ml-11">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
    )
  }

  // Table variant
  return (
    <div className="grid grid-cols-[2fr,1fr,1.5fr,1.5fr,auto] gap-4 px-6 py-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded" />
    </div>
  )
}

// Voice-specific skeleton (for voice cloning page)
export function VoiceListItemSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-900 rounded-lg">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  )
}

