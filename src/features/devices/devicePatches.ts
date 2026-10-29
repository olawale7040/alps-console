import { createContext, useContext } from 'react'
import type { DeviceState } from './types'

export interface DevicePatch {
  readonly state: DeviceState
}

export type DevicePatches = Readonly<Record<string, DevicePatch>>

export interface DevicePatchesValue {
  readonly patches: DevicePatches
  readonly setPatch: (deviceId: string, patch: DevicePatch) => void
  readonly clearPatch: (deviceId: string) => void
}

export const DevicePatchesContext = createContext<DevicePatchesValue | null>(null)

export function useDevicePatches(): DevicePatchesValue {
  const value = useContext(DevicePatchesContext)
  if (!value) throw new Error('useDevicePatches must be used within <DevicePatchesProvider>')
  return value
}

export const withPatch = <T extends { id: string }>(device: T, patches: DevicePatches): T => {
  const patch = patches[device.id]
  return patch ? { ...device, ...patch } : device
}
