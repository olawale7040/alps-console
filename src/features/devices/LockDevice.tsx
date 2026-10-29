import { Notice } from '../../components/Notice'
import { useLockDevice } from './useLockDevice'

interface LockDeviceProps {
  deviceId: string
  stateId: number | undefined
  onLocked: () => void
}

export function LockDevice({ deviceId, stateId, onLocked }: LockDeviceProps) {
  const { canLock, locking, locked, error, actionsError, lock } = useLockDevice(
    deviceId,
    stateId,
    onLocked,
  )

  return (
    <div>
      {canLock && (
        <button type="button" disabled={locking} onClick={lock}>
          {locking ? 'Locking…' : 'Lock device'}
        </button>
      )}
      {locked && <Notice>Device locked.</Notice>}
      {error && <Notice tone="error">Couldn't lock the device: {error}</Notice>}
      {actionsError && (
        <Notice tone="error">Couldn't load the available actions: {actionsError}</Notice>
      )}
    </div>
  )
}
