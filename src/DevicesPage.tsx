import { useState } from 'react'
import { DeviceList } from './features/devices/DeviceList'
import styles from './DevicesPage.module.css'

export function DevicesPage() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>()

  return (
    <div className={styles.layout}>
      <DeviceList selectedDeviceId={selectedDeviceId} onSelect={setSelectedDeviceId} />
    </div>
  )
}
