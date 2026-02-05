import { User, Home, Building, RefreshCw, Briefcase } from 'lucide-react'

export interface PropertyTypeOption {
  value: string
  label: string
  icon: React.ComponentType<any>
  color: string
  description: string
}

export const propertyTypes: PropertyTypeOption[] = [
  {
    value: 'BACHELOR',
    label: 'Bachelor',
    icon: User,
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    description: 'Individual accommodation for students/working professionals'
  },
  {
    value: 'FAMILY',
    label: 'Family',
    icon: Home,
    color: 'bg-green-100 text-green-700 border-green-300',
    description: 'Spacious accommodation for families'
  },
  {
    value: 'HOSTEL',
    label: 'Hostel',
    icon: Building,
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    description: 'Shared accommodation with common facilities'
  },
  {
    value: 'SUBLET',
    label: 'Sublet',
    icon: RefreshCw,
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    description: 'Temporary rental accommodation'
  },
  {
    value: 'OFFICE',
    label: 'Office',
    icon: Briefcase,
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    description: 'Commercial office space'
  }
]

export const propertyTypeLabels: Record<string, string> = {
  BACHELOR: 'Bachelor',
  FAMILY: 'Family',
  HOSTEL: 'Hostel',
  SUBLET: 'Sublet',
  OFFICE: 'Office'
}