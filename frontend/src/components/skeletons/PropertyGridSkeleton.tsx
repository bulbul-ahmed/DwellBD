import React from 'react'
import PropertyCardSkeleton from './PropertyCardSkeleton'

interface PropertyGridSkeletonProps {
  count?: number
}

const PropertyGridSkeleton: React.FC<PropertyGridSkeletonProps> = ({ count = 20 }) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  )
}

export default PropertyGridSkeleton
