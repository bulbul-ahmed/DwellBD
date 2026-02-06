import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchProperties, PropertyFilters } from '../api/propertyApi'

export const usePropertySearch = (initialFilters: PropertyFilters) => {
  const [filters, setFilters] = useState(initialFilters)

  const { data: searchResult, isLoading, error } = useQuery({
    queryKey: ['search-properties', filters],
    queryFn: () => searchProperties(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
    refetchOnWindowFocus: false,
  })

  const updateFilters = useCallback((newFilters: Partial<PropertyFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1,
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  const properties = searchResult?.properties || []
  const total = searchResult?.total || 0
  const pages = searchResult?.pages || 1

  return {
    filters,
    setFilters,
    updateFilters,
    resetFilters,
    properties,
    total,
    pages,
    isLoading,
    error,
  }
}
