import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import LazyImage from './ui/LazyImage'

interface PropertyImageGalleryProps {
  images?: string[]
  title: string
  isVerified?: boolean
}

const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = ({
  images = [],
  title,
  isVerified = false,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const mainImage = images[currentImageIndex] || '/placeholder-property.jpg'

  return (
    <div className="space-y-4">
      {/* Main Image with Navigation */}
      <div className="relative">
        <LazyImage
          src={mainImage}
          alt={title}
          className="h-96 w-full rounded-lg object-cover"
        />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex space-x-2">
          {isVerified && (
            <span className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white">
              Verified
            </span>
          )}
        </div>

        {/* Image Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black bg-opacity-50 p-2 text-white transition-all hover:bg-opacity-75"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black bg-opacity-50 p-2 text-white transition-all hover:bg-opacity-75"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded bg-black bg-opacity-50 px-3 py-1 text-sm text-white">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(1, 5).map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index + 1)}
              className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                currentImageIndex === index + 1 ? 'border-primary-600' : 'border-transparent'
              }`}
            >
              <LazyImage
                src={image}
                alt={`Property image ${index + 2}`}
                className="h-24 w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default PropertyImageGallery
