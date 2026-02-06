import React from 'react'
import { Phone, Mail, MessageCircle, Star } from 'lucide-react'
import Button from './ui/Button'
import { getAvatarInitials, getUserDisplayName } from '../utils/formatters'

interface PropertyOwnerCardProps {
  owner: {
    id: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    avatar?: string
  }
  ownerRating?: number
  ownerRatingsCount?: number
  onContactClick: () => void
}

const PropertyOwnerCard: React.FC<PropertyOwnerCardProps> = ({
  owner,
  ownerRating = 0,
  ownerRatingsCount = 0,
  onContactClick,
}) => {
  const displayName = getUserDisplayName({
    firstName: owner.firstName,
    lastName: owner.lastName,
  })

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Property Owner</h3>

      {/* Owner Info */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-600">
          {getAvatarInitials(owner.firstName, owner.lastName)}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{displayName}</p>
          {ownerRatingsCount > 0 && (
            <div className="flex items-center space-x-1 text-sm">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="text-gray-600">
                {ownerRating.toFixed(1)} ({ownerRatingsCount} reviews)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="mb-6 space-y-3 border-y border-gray-200 py-4">
        {owner.phone && (
          <a href={`tel:${owner.phone}`} className="flex items-center space-x-3 text-gray-700 hover:text-primary-600">
            <Phone size={18} />
            <span className="text-sm">{owner.phone}</span>
          </a>
        )}
        {owner.email && (
          <a href={`mailto:${owner.email}`} className="flex items-center space-x-3 text-gray-700 hover:text-primary-600">
            <Mail size={18} />
            <span className="text-sm">{owner.email}</span>
          </a>
        )}
      </div>

      {/* Contact Button */}
      <Button onClick={onContactClick} className="w-full">
        <MessageCircle size={18} className="mr-2" />
        Send Message
      </Button>
    </div>
  )
}

export default PropertyOwnerCard
