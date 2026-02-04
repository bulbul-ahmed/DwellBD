import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

// User types
export type UserRole = 'TENANT' | 'OWNER' | 'ADMIN'

export interface CreateUserInput {
  email: string
  phone?: string
  password: string
  firstName: string
  lastName: string
  role?: UserRole
}

// Property types
export type PropertyType = 'BACHELOR' | 'FAMILY' | 'HOSTEL' | 'SUBLET' | 'OFFICE'
export type ListingType = 'RENT' | 'SELL'
export type Furnished = 'NONE' | 'PARTIAL' | 'FULL'
export type RentPeriod = 'MONTHLY' | 'YEARLY'
export type PropertyStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'RENTED' | 'SOLD'

export interface CreatePropertyInput {
  title: string
  description?: string
  propertyType: PropertyType
  listingType?: ListingType
  address: string
  area: string
  city?: string
  latitude?: number
  longitude?: number
  bedrooms?: number
  bathrooms?: number
  floorNumber?: number
  totalFloors?: number
  squareFeet?: number
  furnished?: Furnished
  rentAmount: number
  rentPeriod?: RentPeriod
  securityDeposit?: number
  advancePayment?: number
  amenities: string[]
  availableFrom?: Date
  coverImage?: string
  images: string[]
  videoUrl?: string
  ownerId: string
}
