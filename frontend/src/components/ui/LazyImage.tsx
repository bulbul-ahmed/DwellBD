import { useState, useEffect, useRef } from 'react'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholderClassName?: string
  onLoad?: () => void
}

export default function LazyImage({
  src,
  alt,
  className = '',
  placeholderClassName = '',
  onLoad,
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !imageSrc && !error) {
            setImageSrc(src)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current)
      }
    }
  }, [src, imageSrc, error])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setError(true)
    setIsLoading(false)
  }

  return (
    <div className={`relative ${className}`} ref={imgRef}>
      {isLoading && !error && (
        <div className={`absolute inset-0 animate-pulse bg-gray-300 ${placeholderClassName}`} />
      )}
      {error && (
        <div className={`absolute inset-0 flex items-center justify-center bg-gray-200 ${placeholderClassName}`}>
          <span className="text-gray-500 text-sm">Image unavailable</span>
        </div>
      )}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      {!imageSrc && !error && (
        <div className={`w-full h-full bg-gray-200 flex items-center justify-center ${placeholderClassName}`}>
          <span className="text-gray-400 text-sm">Loading...</span>
        </div>
      )}
    </div>
  )
}
