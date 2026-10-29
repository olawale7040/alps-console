import { useEffect, useReducer } from 'react'
import { deviceFiltersReducer, initialDeviceFilters } from './deviceFilters'

const SEARCH_DEBOUNCE_MS = 300

export function useDeviceFilters() {
  const [filters, dispatch] = useReducer(deviceFiltersReducer, initialDeviceFilters)

  useEffect(() => {
    const timer = setTimeout(() => dispatch({ type: 'searchSettled' }), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [filters.input])

  return { filters, dispatch }
}
