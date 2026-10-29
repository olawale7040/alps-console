import { useDevicePatches, withPatch } from './devicePatches'
import { formatTimestamp, primaryImei } from './deviceFormat'
import type { DeviceSummary } from './types'
import styles from './DeviceTable.module.css'

interface DeviceTableProps {
  devices: DeviceSummary[]
  selectedDeviceId: string | undefined
  busy: boolean
  onSelect: (deviceId: string) => void
}

export function DeviceTable({ devices, selectedDeviceId, busy, onSelect }: DeviceTableProps) {
  const { patches } = useDevicePatches()
  const rows = devices.map((device) => withPatch(device, patches))

  return (
    <table className={styles.table} aria-busy={busy}>
      <thead>
        <tr>
          <th>Serial number</th>
          <th>IMEI</th>
          <th>Model</th>
          <th>State</th>
          <th>Last check-in</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((device) => (
          <tr key={device.id} aria-current={device.id === selectedDeviceId || undefined}>
            <td>
              <button type="button" className={styles.select} onClick={() => onSelect(device.id)}>
                {device.serialNumber}
              </button>
            </td>
            <td>{primaryImei(device.IMEIs)}</td>
            <td>{device.modelMarketingName}</td>
            <td>{device.state?.name}</td>
            <td>{formatTimestamp(device.lastCheckin)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
