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
