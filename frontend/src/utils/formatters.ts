/**
 * Shared formatting utilities used across components
 */

export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatDateWithTime = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const getUserDisplayName = (user: { firstName?: string; lastName?: string }): string => {
  const first = user.firstName || ''
  const last = user.lastName || ''
  return `${first} ${last}`.trim()
}

export const getAvatarInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.[0] || ''
  const last = lastName?.[0] || ''
  return `${first}${last}`.toUpperCase()
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

export const formatRating = (rating: number): string => {
  return `${rating.toFixed(1)}`
}

export const getStarArray = (rating: number): boolean[] => {
  return Array.from({ length: 5 }, (_, i) => i < Math.round(rating))
}
