import { formatTimestamp, orUnavailable, primaryImei } from '../shared/deviceFormat'
import type { DeviceDetail } from '../api/types'
import styles from './DeviceFacts.module.css'

export function DeviceFacts({ detail }: { detail: DeviceDetail }) {
  const facts: [string, string][] = [
    ['Serial number', orUnavailable(detail.serialNumber)],
    ['Model', orUnavailable(detail.deviceModelMarketingName)],
    ['Brand', orUnavailable(detail.deviceBrandName)],
    ['IMEI', orUnavailable(primaryImei(detail.IMEIs))],
    ['IMSI', orUnavailable(detail.imsi)],
    ['State', orUnavailable(detail.state?.name)],
    ['Policy', orUnavailable(detail.policy?.name)],
    ['Locale', orUnavailable(detail.locale)],
    ['Last check-in', formatTimestamp(detail.lastCheckin?.date ?? null)],
    ['First enrolled', formatTimestamp(detail.firstEnrollAt)],
  ]

  return (
    <dl className={styles.facts}>
      {facts.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
