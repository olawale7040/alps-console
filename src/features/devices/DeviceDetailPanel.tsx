import { QueryView } from '../../components/QueryView'
import { useTenantQuery } from '../../tenancy/useTenantQuery'
import { DeviceFacts } from './DeviceFacts'
import { DeviceHistory } from './DeviceHistory'
import { DEVICE_DETAIL } from './operations'
import type { DeviceDetailData, DeviceDetailVariables } from './types'

export function DeviceDetailPanel({ deviceId }: { deviceId: string }) {
  const { data, loading, errors } = useTenantQuery<DeviceDetailData, DeviceDetailVariables>(
    DEVICE_DETAIL,
    { variables: { deviceId }, fetchFirst: true, queryKey: `device:${deviceId}:detail` },
  )
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
        {detail && <DeviceFacts detail={detail} />}
      </QueryView>
      <DeviceHistory deviceId={deviceId} />
    </section>
  )
}
