import type { ListDevicesVariables } from './types'

export const DEVICE_PAGE_SIZE = 10

export interface DeviceFilters {
  readonly input: string
  readonly term: string
  readonly stateId: number | undefined
  readonly page: number
}

export type DeviceFiltersAction =
  | { type: 'inputChanged'; input: string }
  | { type: 'searchSettled' }
  | { type: 'stateChanged'; stateId: number | undefined }
  | { type: 'pageChanged'; page: number }

export const initialDeviceFilters: DeviceFilters = {
  input: '',
  term: '',
  stateId: undefined,
  page: 1,
}

export function deviceFiltersReducer(
  filters: DeviceFilters,
  action: DeviceFiltersAction,
): DeviceFilters {
  switch (action.type) {
    case 'inputChanged':
      return { ...filters, input: action.input }

    case 'searchSettled': {
      const term = filters.input.trim()
      return term === filters.term ? filters : { ...filters, term, page: 1 }
    }

    case 'stateChanged':
      return action.stateId === filters.stateId
        ? filters
        : { ...filters, stateId: action.stateId, page: 1 }

    case 'pageChanged':
      return action.page === filters.page ? filters : { ...filters, page: action.page }
  }
}

const searchVariables = (term: string): Pick<ListDevicesVariables, 'imei' | 'serialNumber'> => {
  if (!term) return {}
  return /^\d+$/.test(term) ? { imei: term } : { serialNumber: term }
}

export const toListVariables = ({ term, stateId, page }: DeviceFilters): ListDevicesVariables => ({
  ...searchVariables(term),
  stateId,
  page,
  pageSize: DEVICE_PAGE_SIZE,
})
