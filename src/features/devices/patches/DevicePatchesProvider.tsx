import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { DevicePatchesContext, type DevicePatch, type DevicePatches } from './devicePatches'

export function DevicePatchesProvider({ children }: { children: ReactNode }) {
  const [patches, setPatches] = useState<DevicePatches>({})

  const setPatch = useCallback((deviceId: string, patch: DevicePatch) => {
    setPatches((current) => ({ ...current, [deviceId]: patch }))
  }, [])

  const clearPatch = useCallback((deviceId: string) => {
    setPatches(({ [deviceId]: _removed, ...rest }) => rest)
  }, [])

  const value = useMemo(() => ({ patches, setPatch, clearPatch }), [patches, setPatch, clearPatch])

  return <DevicePatchesContext value={value}>{children}</DevicePatchesContext>
}
