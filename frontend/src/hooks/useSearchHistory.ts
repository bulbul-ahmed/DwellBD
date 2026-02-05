import { useState, useEffect } from 'react'

interface SearchHistoryItem {
  query: string
  area?: string
  timestamp: number
}

const MAX_HISTORY_ITEMS = 10
const SEARCH_HISTORY_KEY = 'bdflathub_search_history'

export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])

  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY)
      if (stored) {
        const parsed: SearchHistoryItem[] = JSON.parse(stored)
        setSearchHistory(parsed)
      }
    } catch (error) {
      console.error('Failed to load search history:', error)
    }
  }, [])

  // Add search to history
  const addToHistory = (query: string, area?: string) => {
    const newSearch: SearchHistoryItem = {
      query: query.trim(),
      area,
      timestamp: Date.now()
    }

    setSearchHistory(prev => {
      // Remove existing entry if already exists
      const filtered = prev.filter(item =>
        !(item.query === query.trim() && item.area === area)
      )

      // Add new search to beginning
      const updated = [newSearch, ...filtered].slice(0, MAX_HISTORY_ITEMS)

      // Save to localStorage
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated))
      } catch (error) {
        console.error('Failed to save search history:', error)
      }

      return updated
    })
  }

  // Clear search history
  const clearHistory = () => {
    setSearchHistory([])
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY)
    } catch (error) {
      console.error('Failed to clear search history:', error)
    }
  }

  // Remove specific search from history
  const removeFromHistory = (query: string, area?: string) => {
    setSearchHistory(prev => {
      const updated = prev.filter(item =>
        !(item.query === query.trim() && item.area === area)
      )

      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated))
      } catch (error) {
        console.error('Failed to update search history:', error)
      }

      return updated
    })
  }

  return {
    searchHistory,
    addToHistory,
    clearHistory,
    removeFromHistory
  }
}