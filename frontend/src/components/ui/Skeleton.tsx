import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  children?: React.ReactNode
}

function Skeleton({ className, children, ...props }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse rounded-md bg-gray-200', className)} {...props}>
      {children}
    </div>
  )
}

// Skeleton components for different use cases
export function SkeletonCard() {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-4 aspect-video w-full rounded-lg bg-gray-200" />
      <div className="space-y-3">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />
        <div className="flex items-center space-x-4">
          <div className="h-4 w-20 rounded bg-gray-200" />
          <div className="h-4 w-24 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonHeader() {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 rounded bg-gray-200" />
        <div className="h-6 w-32 rounded bg-gray-200" />
      </div>
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 rounded-full bg-gray-200" />
        <div className="h-8 w-8 rounded-full bg-gray-200" />
      </div>
    </div>
  )
}

export function PropertyListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-lg bg-white p-4 shadow-sm">
          <div className="mb-4 aspect-video w-full rounded-lg bg-gray-200" />
          <div className="space-y-3">
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
            <div className="flex items-center space-x-4">
              <div className="h-4 w-16 rounded bg-gray-200" />
              <div className="h-4 w-20 rounded bg-gray-200" />
            </div>
            <div className="h-10 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SearchFilterSkeleton() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="space-y-4">
        <div className="h-10 w-full rounded-lg bg-gray-200" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 rounded-lg bg-gray-200" />
          <div className="h-10 rounded-lg bg-gray-200" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded bg-gray-200" />
              <div className="h-4 w-24 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Skeleton
