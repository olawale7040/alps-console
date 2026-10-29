import type { ActionDispatch } from 'react'
import type { DeviceFilters, DeviceFiltersAction } from './deviceFilters'
import { DEVICE_STATES } from '../shared/deviceStates'
import styles from './DeviceFilterBar.module.css'

interface DeviceFilterBarProps {
  filters: DeviceFilters
  dispatch: ActionDispatch<[DeviceFiltersAction]>
}

export function DeviceFilterBar({ filters, dispatch }: DeviceFilterBarProps) {
  return (
    <div className={styles.filters}>
      <input
        type="search"
        value={filters.input}
        placeholder="Search IMEI or serial number"
        aria-label="Search devices"
        onChange={(event) => dispatch({ type: 'inputChanged', input: event.target.value })}
      />
      <select
        value={filters.stateId ?? ''}
        aria-label="Filter by state"
        onChange={(event) =>
          dispatch({
            type: 'stateChanged',
            stateId: event.target.value ? Number(event.target.value) : undefined,
          })
        }
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
