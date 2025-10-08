import { useState, useCallback } from 'react'

function useFilters(initialState = {}, onFilterChange) {
  const [filters, setFilters] = useState(initialState)
  const [showFilters, setShowFilters] = useState(false)

  const updateFilter = useCallback(
    (key, value) => {
      const newFilters = { ...filters, [key]: value }
      setFilters(newFilters)
      if (onFilterChange) {
        onFilterChange(newFilters)
      }
    },
    [filters, onFilterChange]
  )

  const clearFilter = useCallback(
    (key) => {
      const newFilters = { ...filters }
      if (initialState[key] !== undefined) {
        newFilters[key] = initialState[key]
      } else {
        delete newFilters[key]
      }
      setFilters(newFilters)
      if (onFilterChange) {
        onFilterChange(newFilters)
      }
    },
    [filters, initialState, onFilterChange]
  )

  const clearAllFilters = useCallback(() => {
    setFilters(initialState)
    if (onFilterChange) {
      onFilterChange(initialState)
    }
  }, [initialState, onFilterChange])

  const toggleShowFilters = useCallback(() => {
    setShowFilters((prev) => !prev)
  }, [])

  const getActiveFilters = useCallback(
    (filterConfig) => {
      const active = []

      Object.entries(filters).forEach(([key, value]) => {
        const config = filterConfig[key]
        if (
          config &&
          value &&
          value !== 'ALL' &&
          value !== 'all' &&
          value !== ''
        ) {
          active.push({
            key,
            label: config.label,
            displayValue: config.getDisplayValue
              ? config.getDisplayValue(value)
              : value,
          })
        }
      })

      return active
    },
    [filters]
  )

  return {
    filters,
    showFilters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    toggleShowFilters,
    getActiveFilters,
  }
}

export default useFilters
