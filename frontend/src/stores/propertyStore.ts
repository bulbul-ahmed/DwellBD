import { create } from 'zustand'
import {
  searchProperties,
  getProperty,
  getMyProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImages,
  Property,
  PropertyData,
  PropertyFilters,
} from '../api/propertyApi'

interface PropertyState {
  properties: Property[]
  currentProperty: Property | null
  myProperties: Property[]
  total: number
  currentPage: number
  pages: number
  isLoading: boolean
  error: string | null

  // Search and filter
  searchProperties: (filters: PropertyFilters) => Promise<void>
  getProperty: (id: string) => Promise<void>
  getMyProperties: (page?: number, limit?: number) => Promise<void>

  // CRUD operations
  createProperty: (data: PropertyData) => Promise<void>
  updateProperty: (id: string, data: Partial<PropertyData>) => Promise<void>
  deleteProperty: (id: string) => Promise<void>

  // File upload
  uploadImages: (files: File[]) => Promise<string[]>

  // State management
  clearError: () => void
  clearCurrentProperty: () => void
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  currentProperty: null,
  myProperties: [],
  total: 0,
  currentPage: 1,
  pages: 1,
  isLoading: false,
  error: null,

  searchProperties: async (filters: PropertyFilters) => {
    set({ isLoading: true, error: null })
    try {
      const response = await searchProperties(filters)
      set({
        properties: response.properties,
        total: response.total,
        pages: response.pages,
        currentPage: response.currentPage,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search failed'
      set({ error: message, isLoading: false })
    }
  },

  getProperty: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await getProperty(id)
      console.log('🖼️ Property loaded:', {
        id: response.property.id,
        title: response.property.title,
        coverImage: response.property.coverImage,
        imagesCount: response.property.images?.length || 0,
        images: response.property.images
      })
      set({
        currentProperty: response.property,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch property'
      set({ error: message, isLoading: false })
    }
  },

  getMyProperties: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null })
    try {
      const response = await getMyProperties(page, limit)
      set({
        myProperties: response.properties,
        total: response.total,
        pages: response.pages,
        currentPage: response.currentPage,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch properties'
      set({ error: message, isLoading: false })
    }
  },

  createProperty: async (data: PropertyData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await createProperty(data)
      set({
        myProperties: [...(get().myProperties || []), response.property],
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create property'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  updateProperty: async (id: string, data: Partial<PropertyData>) => {
    set({ isLoading: true, error: null })
    try {
      const response = await updateProperty(id, data)
      const myProperties = get().myProperties.map((p) => (p.id === id ? response.property : p))
      set({
        myProperties,
        currentProperty:
          get().currentProperty?.id === id ? response.property : get().currentProperty,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update property'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  deleteProperty: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await deleteProperty(id)
      const myProperties = get().myProperties.filter((p) => p.id !== id)
      set({
        myProperties,
        currentProperty: get().currentProperty?.id === id ? null : get().currentProperty,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete property'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  uploadImages: async (files: File[]) => {
    set({ isLoading: true, error: null })
    try {
      const response = await uploadPropertyImages(files)
      set({ isLoading: false })
      return response.urls
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload images'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentProperty: () => set({ currentProperty: null }),
}))
