import {
  Wifi,
  Car,
  Zap,
  Shield,
  Utensils,
  Tv,
  Flame,
  ArrowUpCircle,
  Building2,
  Waves,
  Dumbbell,
  Shirt,
  Users,
} from 'lucide-react'

export interface AmenityOption {
  id: string
  label: string
  icon: React.ComponentType<any>
  color: string
  category: 'essential' | 'comfort' | 'luxury'
  description?: string
}

export const amenities: AmenityOption[] = [
  // Essential Amenities
  {
    id: 'wifi',
    label: 'WiFi',
    icon: Wifi,
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    category: 'essential',
    description: 'High-speed internet connection'
  },
  {
    id: 'parking',
    label: 'Parking',
    icon: Car,
    color: 'bg-green-100 text-green-700 border-green-300',
    category: 'essential',
    description: 'Dedicated parking space'
  },
  {
    id: 'generator',
    label: 'Generator',
    icon: Zap,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    category: 'essential',
    description: 'Power backup system'
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    color: 'bg-red-100 text-red-700 border-red-300',
    category: 'essential',
    description: '24/7 security & CCTV'
  },
  {
    id: 'gas',
    label: 'Gas Connection',
    icon: Flame,
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    category: 'essential',
    description: 'Cooking gas supply'
  },

  // Comfort Amenities
  {
    id: 'meals',
    label: 'Meals',
    icon: Utensils,
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    category: 'comfort',
    description: 'Meal services included'
  },
  {
    id: 'tv',
    label: 'TV',
    icon: Tv,
    color: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    category: 'comfort',
    description: 'Television entertainment'
  },
  {
    id: 'laundry',
    label: 'Laundry Service',
    icon: Shirt,
    color: 'bg-pink-100 text-pink-700 border-pink-300',
    category: 'comfort',
    description: 'Washing & drying services'
  },
  {
    id: 'commonRoom',
    label: 'Common Room',
    icon: Users,
    color: 'bg-teal-100 text-teal-700 border-teal-300',
    category: 'comfort',
    description: 'Shared living space'
  },

  // Luxury Amenities
  {
    id: 'elevator',
    label: 'Elevator',
    icon: ArrowUpCircle,
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    category: 'luxury',
    description: 'Lift facility'
  },
  {
    id: 'balcony',
    label: 'Balcony',
    icon: Building2,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    category: 'luxury',
    description: 'Outdoor balcony space'
  },
  {
    id: 'swimmingPool',
    label: 'Swimming Pool',
    icon: Waves,
    color: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    category: 'luxury',
    description: 'Swimming pool access'
  },
  {
    id: 'gym',
    label: 'Gym',
    icon: Dumbbell,
    color: 'bg-rose-100 text-rose-700 border-rose-300',
    category: 'luxury',
    description: 'Fitness center access'
  }
]

export const amenityCategories = {
  essential: 'Essential',
  comfort: 'Comfort',
  luxury: 'Luxury'
}

export const getAmenitiesByCategory = (category: string) => {
  return amenities.filter(amenity => amenity.category === category)
}

export const getTopAmenities = (count: number = 4) => {
  // Return most commonly needed amenities
  return amenities.slice(0, count)
}