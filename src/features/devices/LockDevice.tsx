import { Notice } from '../../components/Notice'
import { useLockDevice } from './useLockDevice'

interface LockDeviceProps {
  deviceId: string
  stateId: number | undefined
}

export function LockDevice({ deviceId, stateId }: LockDeviceProps) {
  const { canLock, locking, error, lock } = useLockDevice(deviceId, stateId)

  return (
    <div>
      {canLock && (
        <button type="button" disabled={locking} onClick={lock}>
          {locking ? 'Locking…' : 'Lock device'}
        </button>
      )}
      {error && <Notice tone="error">Couldn't lock the device: {error}</Notice>}
    </div>
  )
}
