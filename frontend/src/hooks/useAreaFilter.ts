import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

interface AreaFilterOptions {
  defaultValue?: string
  autoSync?: boolean
}

export function useAreaFilter(options: AreaFilterOptions = {}) {
  const { defaultValue = '', autoSync = true } = options
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedArea, setSelectedArea] = useState(defaultValue)

  // Sync with URL parameters
  useEffect(() => {
    if (autoSync) {
      const urlArea = searchParams.get('area')
      if (urlArea !== null) {
        setSelectedArea(urlArea)
      } else if (!defaultValue) {
        setSelectedArea('')
      }
    }
  }, [searchParams, autoSync, defaultValue])

  // Update URL when area changes
  const setArea = (area: string) => {
    setSelectedArea(area)
    if (autoSync) {
      const params = new URLSearchParams(searchParams)
      if (area) {
        params.set('area', area)
      } else {
        params.delete('area')
      }
      setSearchParams(params, { replace: true })
    }
  }

  const clearArea = () => {
    setSelectedArea('')
    if (autoSync) {
      const params = new URLSearchParams(searchParams)
      params.delete('area')
      setSearchParams(params, { replace: true })
    }
  }

  const hasArea = !!selectedArea

  return {
    selectedArea,
    setArea,
    clearArea,
    hasArea,
    isCleared: !selectedArea
  }
}