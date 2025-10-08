/**
 * Standardized configuration for filtering and sorting across the app
 */

// Alert Sort Options
export const ALERT_SORT_OPTIONS = [
  { value: 'newest', label: 'Najnowsze' },
  { value: 'oldest', label: 'Najstarsze' },
  { value: 'matches', label: 'Najwięcej dopasowań' },
  { value: 'name', label: 'Nazwa (A-Z)' },
]

// Alert Status Options
export const ALERT_STATUS_OPTIONS = [
  { value: 'ALL', label: 'Wszystkie' },
  { value: 'ACTIVE', label: 'Aktywne' },
  { value: 'PAUSED', label: 'Wstrzymane' },
]

// Match Sort Options
export const MATCH_SORT_OPTIONS = [
  { value: 'newest', label: 'Najnowsze' },
  { value: 'oldest', label: 'Najstarsze' },
  { value: 'price-low', label: 'Cena: Rosnąco' },
  { value: 'price-high', label: 'Cena: Malejąco' },
  { value: 'footage-low', label: 'Metraż: Rosnąco' },
  { value: 'footage-high', label: 'Metraż: Malejąco' },
  { value: 'score-high', label: 'Dopasowanie: Najlepsze' },
  { value: 'score-low', label: 'Dopasowanie: Najgorsze' },
]

// Default values
export const DEFAULT_SORT = {
  ALERTS: 'newest',
  MATCHES: 'newest',
}

export const DEFAULT_FILTER = {
  STATUS: 'ALL',
  CITY: 'ALL',
  ALERT: 'all',
}

// Helper functions
export const buildQueryParams = (filters) => {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'ALL' && value !== 'all' && value !== '') {
      params.append(key, value)
    }
  })

  return params.toString()
}

export const getStatusLabel = (status) => {
  const option = ALERT_STATUS_OPTIONS.find((opt) => opt.value === status)
  return option ? option.label : status
}

export const getSortLabel = (sortValue, type = 'alerts') => {
  const options = type === 'alerts' ? ALERT_SORT_OPTIONS : MATCH_SORT_OPTIONS
  const option = options.find((opt) => opt.value === sortValue)
  return option ? option.label : sortValue
}
