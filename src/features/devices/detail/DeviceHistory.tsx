import { Pagination } from '../../../components/Pagination'
import { QueryView } from '../../../components/QueryView'
import { useTenantQuery } from '../../../tenancy/useTenantQuery'
import { historyQueryKey } from '../api/deviceCache'
import { formatTimestamp, valueOrUnavailable } from '../shared/deviceFormat'
import { LIST_DEVICE_HISTORY } from '../api/operations'
import { pageCount } from '../shared/pagination'
import type { DeviceHistoryData, DeviceHistoryVariables } from '../api/types'
import styles from './DeviceHistory.module.css'

const HISTORY_PAGE_SIZE = 5

interface DeviceHistoryProps {
  deviceId: string
  page: number
  onPageChange: (page: number) => void
}

export function DeviceHistory({ deviceId, page, onPageChange }: DeviceHistoryProps) {
  const { data, loading, errors } = useTenantQuery<DeviceHistoryData, DeviceHistoryVariables>(
    LIST_DEVICE_HISTORY,
    {
      variables: { deviceId, page, pageSize: HISTORY_PAGE_SIZE },
      fetchFirst: true,
      queryKey: historyQueryKey(deviceId),
    },
  )

  const entries = data?.listDeviceHistory?.histories ?? []
  const totalCount = data?.listDeviceHistory?.pageInfo?.total_count ?? 0

  return (
    <section aria-label="Device history" className={styles.history}>
      <h2>History</h2>
      <QueryView
        loading={loading}
        errors={errors}
        data={data}
        isEmpty={entries.length === 0}
        loadingLabel="Loading history…"
        emptyLabel="No history yet."
      >
        <ol className={styles.entries} aria-busy={loading}>
          {entries.map((entry, index) => (
            <li key={`${entry.createdAt}-${index}`}>
              <strong>{valueOrUnavailable(entry.actionName)}</strong>
              <span>
                {valueOrUnavailable(entry.policyName)} → {valueOrUnavailable(entry.nextPolicyName)}
              </span>
              <small>
                {valueOrUnavailable(formatTimestamp(entry.createdAt))} ·{' '}
                {valueOrUnavailable(entry.email)}
              </small>
            </li>
          ))}
        </ol>
      </QueryView>
      {totalCount > 0 && (
        <Pagination
          label="History pagination"
          page={page}
          pageCount={pageCount(totalCount, HISTORY_PAGE_SIZE)}
          onPageChange={onPageChange}
        />
      )}
    </section>
  )
}
