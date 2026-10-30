import { formatTimestamp, primaryImei, valueOrUnavailable } from '../shared/deviceFormat'
import type { DeviceDetail } from '../api/types'
import styles from './DeviceFacts.module.css'

export function DeviceFacts({ detail }: { detail: DeviceDetail }) {
  const facts = [
    { label: 'Serial number', value: detail.serialNumber },
    { label: 'Model', value: detail.deviceModelMarketingName },
    { label: 'Brand', value: detail.deviceBrandName },
    { label: 'IMEI', value: primaryImei(detail.IMEIs) },
    { label: 'IMSI', value: detail.imsi },
    { label: 'State', value: detail.state?.name },
    { label: 'Policy', value: detail.policy?.name },
    { label: 'Locale', value: detail.locale },
    { label: 'Last check-in', value: formatTimestamp(detail.lastCheckin?.date) },
    { label: 'First enrolled', value: formatTimestamp(detail.firstEnrollAt) },
  ]

  return (
    <dl className={styles.facts}>
      {facts.map(({ label, value }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{valueOrUnavailable(value)}</dd>
        </div>
      ))}
    </dl>
  )
}
