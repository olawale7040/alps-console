import { Pagination } from '../../components/Pagination'
import { QueryView } from '../../components/QueryView'
import { useTenantQuery } from '../../tenancy/useTenantQuery'
import { DEVICE_PAGE_SIZE, toListVariables } from './deviceFilters'
import { DeviceFilterBar } from './DeviceFilterBar'
import { DeviceTable } from './DeviceTable'
import { LIST_DEVICES } from './operations'
import { pageCount } from './pagination'
import type { ListDevicesData, ListDevicesVariables } from './types'
import { useDeviceFilters } from './useDeviceFilters'

interface DeviceListProps {
  selectedDeviceId: string | undefined
  onSelect: (deviceId: string) => void
}

export function DeviceList({ selectedDeviceId, onSelect }: DeviceListProps) {
  const { filters, dispatch } = useDeviceFilters()
  const { data, loading, errors } = useTenantQuery<ListDevicesData, ListDevicesVariables>(
    LIST_DEVICES,
    { variables: toListVariables(filters), fetchFirst: true, queryKey: 'devices:list' },
  )

  const devices = data?.listDevices?.deviceList ?? []
  const totalCount = data?.listDevices?.pageInfo?.total_count ?? 0

  return (
    <section aria-label="Devices">
      <DeviceFilterBar filters={filters} dispatch={dispatch} />
      <QueryView
        loading={loading}
        errors={errors}
        data={data}
        isEmpty={data !== undefined && devices.length === 0}
        loadingLabel="Loading devices…"
        emptyLabel="No devices match your search."
      >
        <DeviceTable
          devices={devices}
          selectedDeviceId={selectedDeviceId}
          busy={loading}
          onSelect={onSelect}
        />
        <Pagination
          page={filters.page}
          pageCount={pageCount(totalCount, DEVICE_PAGE_SIZE)}
          onPageChange={(page) => dispatch({ type: 'pageChanged', page })}
        />
      </QueryView>
    </section>
  )
}
