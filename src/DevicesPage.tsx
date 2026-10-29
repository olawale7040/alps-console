import { useState } from 'react'
import { Notice } from './components/Notice'
import { DeviceDetailPanel } from './features/devices/DeviceDetailPanel'
import { DeviceList } from './features/devices/DeviceList'
import styles from './DevicesPage.module.css'

export function DevicesPage() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>()

  return (
    <div className={styles.layout}>
      <DeviceList selectedDeviceId={selectedDeviceId} onSelect={setSelectedDeviceId} />
      {selectedDeviceId ? (
        <DeviceDetailPanel key={selectedDeviceId} deviceId={selectedDeviceId} />
      ) : (
        <Notice>Select a device to see its detail and history.</Notice>
      )}
    </div>
  )
}
