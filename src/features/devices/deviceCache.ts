import { invalidateQueryKey, updateEntries } from '../../graphql/requestCache'
import { scopeQueryKey, type TenantId } from '../../tenancy/tenants'
import type { DeviceDetailData, DeviceState, ListDevicesData } from './types'

export const LIST_QUERY_KEY = 'devices:list'
export const detailQueryKey = (deviceId: string) => `device:${deviceId}:detail`
export const historyQueryKey = (deviceId: string) => `device:${deviceId}:history`
export const actionsQueryKey = (deviceId: string) => `device:${deviceId}:actions`

export function commitDeviceState(tenantId: TenantId, deviceId: string, state: DeviceState) {
  updateEntries(
    (entry) => entry.queryKey === scopeQueryKey(tenantId, LIST_QUERY_KEY),
    (data) => {
      const list = data as ListDevicesData
      const deviceList = list.listDevices?.deviceList
      if (!list.listDevices || !deviceList) return data
      return {
        listDevices: {
          ...list.listDevices,
          deviceList: deviceList.map((row) => (row.id === deviceId ? { ...row, state } : row)),
        },
      }
    },
  )

  updateEntries(
    (entry) => entry.queryKey === scopeQueryKey(tenantId, detailQueryKey(deviceId)),
    (data) => {
      const { deviceDetail } = data as DeviceDetailData
      return { deviceDetail: deviceDetail && { ...deviceDetail, state } }
    },
  )
}

export function invalidateDevice(tenantId: TenantId, deviceId: string) {
  invalidateQueryKey(scopeQueryKey(tenantId, detailQueryKey(deviceId)))
  invalidateQueryKey(scopeQueryKey(tenantId, historyQueryKey(deviceId)))
}
