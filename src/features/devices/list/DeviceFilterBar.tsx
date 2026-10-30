import type { ActionDispatch, ChangeEvent } from 'react'
import type { DeviceFilters, DeviceFiltersAction } from './deviceFilters'
import { DEVICE_STATES } from '../shared/deviceStates'
import styles from './DeviceFilterBar.module.css'

interface DeviceFilterBarProps {
  filters: DeviceFilters
  dispatch: ActionDispatch<[DeviceFiltersAction]>
}

export function DeviceFilterBar({ filters, dispatch }: DeviceFilterBarProps) {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'inputChanged', input: event.target.value })
  }

  const handleStateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target
    dispatch({ type: 'stateChanged', stateId: value ? Number(value) : undefined })
  }

  return (
    <div className={styles.filters}>
      <input
        type="search"
        value={filters.input}
        placeholder="Search IMEI or serial number"
        aria-label="Search devices"
        onChange={handleSearchChange}
      />
      <select
        value={filters.stateId ?? ''}
        aria-label="Filter by state"
        onChange={handleStateChange}
      >
        <option value="">All states</option>
        {DEVICE_STATES.map((state) => (
          <option key={state.id} value={state.id}>
            {state.name}
          </option>
        ))}
      </select>
    </div>
  )
}
