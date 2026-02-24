export const CITIES = ['Dhaka'] as const
export type City = typeof CITIES[number]

export const LOCATION_MAP: Record<string, string[]> = {
  'Aftab Nagar': [
    'Block A', 'Block B', 'Block C', 'Block D', 'Block E',
    'Block F', 'Block G', 'Block H', 'Block I', 'Block J', 'Block K',
  ],
  'Banasree': [
    'Block A', 'Block B', 'Block C', 'Block D',
    'Block E', 'Block F', 'Block G', 'Block H',
  ],
}

export const AREAS = Object.keys(LOCATION_MAP)
export const DHAKA_AREAS = AREAS  // backward-compat alias
export type DhakaArea = keyof typeof LOCATION_MAP
