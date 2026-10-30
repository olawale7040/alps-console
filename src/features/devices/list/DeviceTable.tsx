import { useDevicePatches, withPatch } from '../patches/devicePatches'
import { formatTimestamp, valueOrUnavailable, primaryImei } from '../shared/deviceFormat'
import type { DeviceSummary } from '../api/types'
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
    <table className={styles.table} aria-label="Device list" aria-busy={busy}>
      <thead>
        <tr>
          <th scope="col">Serial number</th>
          <th scope="col">IMEI</th>
          <th scope="col">Model</th>
          <th scope="col">State</th>
          <th scope="col">Last check-in</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((device) => (
          <tr key={device.id} aria-current={device.id === selectedDeviceId || undefined}>
            <td>
              <button type="button" className={styles.select} onClick={() => onSelect(device.id)}>
                {valueOrUnavailable(device.serialNumber)}
              </button>
            </td>
            <td>{valueOrUnavailable(primaryImei(device.IMEIs))}</td>
            <td>{valueOrUnavailable(device.modelMarketingName)}</td>
            <td>{valueOrUnavailable(device.state?.name)}</td>
            <td>{valueOrUnavailable(formatTimestamp(device.lastCheckin))}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
