import { useState } from 'react'
import { QueryView } from '../../components/QueryView'
import { useTenantQuery } from '../../tenancy/useTenantQuery'
import { detailQueryKey } from './deviceCache'
import { useDevicePatches, withPatch } from './devicePatches'
import { DeviceFacts } from './DeviceFacts'
import { DeviceHistory } from './DeviceHistory'
import { LockDevice } from './LockDevice'
import { DEVICE_DETAIL } from './operations'
import type { DeviceDetailData, DeviceDetailVariables } from './types'

export function DeviceDetailPanel({ deviceId }: { deviceId: string }) {
  const { data, loading, errors } = useTenantQuery<DeviceDetailData, DeviceDetailVariables>(
    DEVICE_DETAIL,
    { variables: { deviceId }, fetchFirst: true, queryKey: detailQueryKey(deviceId) },
  )
  const { patches } = useDevicePatches()
  const [historyPage, setHistoryPage] = useState(1)
  const detail = data?.deviceDetail

  return (
    <section aria-label="Device detail">
      <QueryView
        loading={loading}
        errors={errors}
        data={data}
        isEmpty={data !== undefined && !detail}
        loadingLabel="Loading device…"
        emptyLabel="Device not found."
      >
        {detail && (
          <>
            <DeviceFacts detail={withPatch(detail, patches)} />
            <LockDevice
              deviceId={deviceId}
              stateId={detail.state?.id}
              onLocked={() => setHistoryPage(1)}
            />
          </>
        )}
      </QueryView>
      <DeviceHistory deviceId={deviceId} page={historyPage} onPageChange={setHistoryPage} />
    </section>
  )
}
