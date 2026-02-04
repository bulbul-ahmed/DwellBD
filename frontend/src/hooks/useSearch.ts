import { useState, useEffect, useRef } from 'react'

interface UseSearchOptions {
  minChars?: number
  delay?: number
}

export function useSearch<T>(options: UseSearchOptions = {}) {
  const { minChars = 2, delay = 300 } = options
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const search = async (searchQuery: string) => {
    if (searchQuery.length < minChars) {
      setResults([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))

      // Mock results - replace with actual search logic
      const mockResults: T[] = []
      setResults(mockResults)
    } catch (err) {
      setError('Failed to search')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      search(query)
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [query])

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setError(null)
  }

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    clearSearch,
  }
}