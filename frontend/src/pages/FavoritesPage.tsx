import { useState, useEffect } from 'react'
import { Heart, MapPin, Bed, Bath, Square } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import { getFavorites, removeFavorite } from '../api/favoriteApi'

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest')

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      setIsLoading(true)
      const favoritesList = await getFavorites()
      setFavorites(favoritesList)
    } catch (error) {
      console.error('Error loading favorites:', error)
      toast.error('Failed to load favorites')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFavorite = async (propertyId: string) => {
    try {
      await removeFavorite(propertyId)
      setFavorites((prev) => prev.filter((fav) => fav.propertyId !== propertyId))
      toast.success('Removed from favorites')
    } catch (error) {
      console.error('Error removing favorite:', error)
      toast.error('Failed to remove favorite')
    }
  }

  const getSortedFavorites = () => {
    const sorted = [...favorites]
    if (sortBy === 'price-low') {
      return sorted.sort((a, b) => a.rentAmount - b.rentAmount)
    } else if (sortBy === 'price-high') {
      return sorted.sort((a, b) => b.rentAmount - a.rentAmount)
    } else {
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    }
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary-600 mx-auto"></div>
          <p className="text-gray-600">Loading saved properties...</p>
        </div>
      </div>
    )
  }

  const sortedFavorites = getSortedFavorites()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Saved Properties</h1>
          <p className="mt-2 text-gray-600">
            {favorites.length} {favorites.length === 1 ? 'property' : 'properties'} saved
          </p>
        </div>

        {/* Sort Controls */}
        {favorites.length > 0 && (
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-600"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        )}

        {/* Empty State */}
        {favorites.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">No saved properties</h3>
            <p className="mb-6 text-gray-600">
              Start exploring properties and save your favorites to view them later
            </p>
            <Link to="/properties">
              <Button className="bg-primary-600 hover:bg-primary-700">
                Explore Properties
              </Button>
            </Link>
          </div>
        ) : (
          /* Favorites Grid */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedFavorites.map((favorite) => (
              <div
                key={favorite.propertyId}
                className="overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative">
                  <Link to={`/properties/${favorite.propertyId}`}>
                    <img
                      src={favorite.images?.[0] || '/placeholder-property.jpg'}
                      alt={favorite.title}
                      className="h-48 w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  </Link>

                  {/* Favorite Button */}
                  <button
                    onClick={() => handleRemoveFavorite(favorite.propertyId)}
                    className="absolute right-3 top-3 rounded-full bg-white p-2 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                  </button>

                  {/* Verified Badge */}
                  {favorite.isVerified && (
                    <span className="absolute left-3 top-3 rounded bg-green-600 px-2 py-1 text-xs font-medium text-white">
                      Verified
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Location */}
                  <div className="mb-2 flex items-center text-sm text-gray-600">
                    <MapPin className="mr-1 h-4 w-4" />
                    <span>{favorite.area}, Dhaka</span>
                  </div>

                  {/* Title */}
                  <Link to={`/properties/${favorite.propertyId}`}>
                    <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                      {favorite.title}
                    </h3>
                  </Link>

                  {/* Amenities */}
                  <div className="mb-3 flex items-center space-x-3 text-sm text-gray-600">
                    {favorite.bedrooms && (
                      <div className="flex items-center">
                        <Bed className="mr-1 h-4 w-4" />
                        <span>{favorite.bedrooms}</span>
                      </div>
                    )}
                    {favorite.bathrooms && (
                      <div className="flex items-center">
                        <Bath className="mr-1 h-4 w-4" />
                        <span>{favorite.bathrooms}</span>
                      </div>
                    )}
                    {favorite.squareFeet && (
                      <div className="flex items-center">
                        <Square className="mr-1 h-4 w-4" />
                        <span>{favorite.squareFeet} sqft</span>
                      </div>
                    )}
                  </div>

                  {/* Price and Button */}
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-primary-600">
                      {formatPrice(favorite.rentAmount)}
                      <span className="text-sm font-normal text-gray-600"> /month</span>
                    </div>
                  </div>

                  {/* View Details Link */}
                  <Link to={`/properties/${favorite.propertyId}`} className="block mt-4">
                    <Button size="md" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FavoritesPage
