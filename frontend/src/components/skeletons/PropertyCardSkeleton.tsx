import React from 'react'

const PropertyCardSkeleton: React.FC = () => {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
      {/* Image Skeleton */}
      <div className="h-64 w-full animate-pulse bg-gray-200" />

      {/* Content Skeleton */}
      <div className="space-y-3 p-4">
        {/* Title */}
        <div className="h-4 w-3/4 animate-pulse bg-gray-200" />

        {/* Details */}
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse bg-gray-200" />
          <div className="h-3 w-2/3 animate-pulse bg-gray-200" />
        </div>

        {/* Price and Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 w-1/3 animate-pulse bg-gray-200" />
          <div className="h-8 w-20 animate-pulse bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  )
}

export default PropertyCardSkeleton
