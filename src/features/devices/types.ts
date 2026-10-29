export interface PageInfo {
  total_count: number | null
}

export interface Imei {
  imei: string | null
  isPrimary: boolean | null
}

export interface DeviceState {
  id: number
  name: string | null
}

export interface Policy {
  id: string
  name: string | null
  color: string | null
}

export interface DeviceSummary {
  id: string
  serialNumber: string | null
  modelMarketingName: string | null
  brandName: string | null
  IMEIs: Imei[] | null
  state: DeviceState | null
  policy: Policy
  lastCheckin: string | null
}

export interface ListDevicesData {
  listDevices: { pageInfo: PageInfo | null; deviceList: DeviceSummary[] | null } | null
}

export interface ListDevicesVariables {
  imei?: string | undefined
  serialNumber?: string | undefined
  stateId?: number | undefined
  page: number
  pageSize: number
}

export interface DeviceDetail {
  id: string
  serialNumber: string | null
  deviceBrandName: string | null
  deviceModelMarketingName: string | null
  IMEIs: Imei[] | null
  imsi: string | null
  locale: string | null
  state: DeviceState | null
  policy: Policy | null
  lastCheckin: { label: string | null; date: string | null; color: string | null } | null
  firstEnrollAt: string | null
}

export interface DeviceDetailData {
  deviceDetail: DeviceDetail | null
}

export interface DeviceDetailVariables {
  deviceId: string
}

export interface HistoryEntry {
  type: string | null
  createdAt: string | null
  email: string | null
  policyName: string | null
  nextPolicyName: string | null
  actionName: string | null
}

export interface DeviceHistoryData {
  listDeviceHistory: { pageInfo: PageInfo | null; histories: HistoryEntry[] | null } | null
}

export interface DeviceHistoryVariables {
  deviceId: string
  page: number
  pageSize: number
}
