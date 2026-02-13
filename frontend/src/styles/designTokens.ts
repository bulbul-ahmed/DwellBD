// Design System Tokens for BD Flat Platform
// Provides consistent colors, spacing, typography, and other design constants

export const colors = {
  // Primary blue palette for stats and accents
  stats: {
    light: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      icon: 'text-blue-600',
      border: 'border-blue-200',
    },
    sky: {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      icon: 'text-sky-600',
      border: 'border-sky-200',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      icon: 'text-indigo-600',
      border: 'border-indigo-200',
    },
    cyan: {
      bg: 'bg-cyan-50',
      text: 'text-cyan-700',
      icon: 'text-cyan-600',
      border: 'border-cyan-200',
    },
  },

  // Status colors (keep existing for badges)
  status: {
    pending: 'bg-yellow-100 text-yellow-800',
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  },

  // Neutrals
  neutral: {
    bg: 'bg-white',
    bgAlt: 'bg-gray-50',
    text: 'text-gray-900',
    textMuted: 'text-gray-600',
    border: 'border-gray-200',
  },
}

export const spacing = {
  page: 'py-8 px-6',
  section: 'mb-8',
  card: 'p-6',
  gap: {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  },
}

export const typography = {
  pageTitle: 'text-3xl font-bold text-gray-900',
  sectionTitle: 'text-xl font-semibold text-gray-900',
  cardTitle: 'text-sm font-medium text-gray-700',
  statValue: 'text-3xl font-bold',
  body: 'text-sm text-gray-600',
}

export const radius = {
  card: 'rounded-xl',
  button: 'rounded-lg',
  badge: 'rounded-full',
}

export const shadows = {
  card: 'shadow-sm hover:shadow-md transition-shadow',
  cardLarge: 'shadow-md',
}
