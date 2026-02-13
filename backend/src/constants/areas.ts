/**
 * Valid areas in Dhaka for property listings and owner service areas
 */
export const DHAKA_AREAS = [
  'Dhanmondi',
  'Gulshan',
  'Banani',
  'Uttara',
  'Mirpur',
  'Mohammadpur',
  'Bashundhara',
  'Baridhara',
  'Lalmatia',
  'Tejgaon',
  'Khilgaon',
  'Motijheel',
  'Ramna',
  'Paltan',
  'Segunbagicha',
  'Kakrail',
  'Shantinagar',
  'Malibagh',
  'Mouchak',
  'Rampura',
  'Badda',
  'Niketon',
  'Eskaton',
  'Moghbazar',
  'New Market',
  'Azimpur',
  'Jigatola',
  'Green Road',
  'Farmgate',
  'Kawran Bazar',
  'Panthapath',
  'Karwan Bazar',
  'Hatirpool',
  'Indira Road',
  'Science Lab',
  'Shahbag',
  'New Elephant Road',
  'Old Dhaka',
  'Lalbagh',
  'Chawkbazar',
  'Sutrapur',
  'Kamrangirchar',
  'Hazaribagh',
  'Sadarghat',
  'Jatrabari',
  'Demra',
  'Shyampur',
  'Postogola',
  'Wari',
  'Armanitola',
  'Bangshal',
  'Gendaria',
  'Nawabganj',
  'Kotwali',
  'Gandaria',
  'Jurain',
  'Rayerbazar',
  'Adabar',
  'Mohakhali',
  'Baridhara DOHS',
  'Banani DOHS',
  'Cantonment',
  'Nikunja',
  'Khilkhet',
  'Airport',
  'Turag',
  'Dakshinkhan',
  'Uttarkhan',
  'Gazipur',
] as const

export type DhakaArea = typeof DHAKA_AREAS[number]

/**
 * Validates if a given area is a valid Dhaka area
 */
export function isValidDhakaArea(area: string): boolean {
  return DHAKA_AREAS.includes(area as DhakaArea)
}

/**
 * Validates an array of areas
 */
export function validateServiceAreas(areas: string[]): { valid: boolean; invalidAreas?: string[] } {
  if (!Array.isArray(areas)) {
    return { valid: false }
  }

  const invalidAreas = areas.filter(area => !isValidDhakaArea(area))

  if (invalidAreas.length > 0) {
    return { valid: false, invalidAreas }
  }

  return { valid: true }
}
