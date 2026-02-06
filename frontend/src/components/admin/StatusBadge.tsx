import React from 'react'

interface StatusBadgeProps {
  status: string
  variant?: 'status' | 'role' | 'verification'
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'status' }) => {
  let bgColor = 'bg-gray-100 text-gray-800'

  if (variant === 'status') {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        bgColor = 'bg-yellow-100 text-yellow-800'
        break
      case 'ACTIVE':
        bgColor = 'bg-green-100 text-green-800'
        break
      case 'INACTIVE':
        bgColor = 'bg-red-100 text-red-800'
        break
      case 'RENTED':
        bgColor = 'bg-blue-100 text-blue-800'
        break
      case 'SOLD':
        bgColor = 'bg-purple-100 text-purple-800'
        break
    }
  } else if (variant === 'role') {
    switch (status?.toUpperCase()) {
      case 'ADMIN':
        bgColor = 'bg-red-100 text-red-800'
        break
      case 'OWNER':
        bgColor = 'bg-blue-100 text-blue-800'
        break
      case 'TENANT':
        bgColor = 'bg-green-100 text-green-800'
        break
    }
  } else if (variant === 'verification') {
    bgColor = status === 'true' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
      {typeof status === 'boolean' ? (status ? 'Verified' : 'Unverified') : status}
    </span>
  )
}

export default StatusBadge
