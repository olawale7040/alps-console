import { useCallback } from 'react'
import { useQuery, type UseQueryOptions, type UseQueryResult } from '../graphql/useQuery'
import { useTenant } from './tenantContext'
import { scopeQueryKey, withTenant, type TenantVariables } from './tenants'

export function useTenantQuery<TData, TVars extends object = Record<string, never>>(
  query: string,
  { variables, fetchFirst, queryKey }: UseQueryOptions<TVars> = {},
): UseQueryResult<TData, TVars> {
  const { tenantId } = useTenant()
  const result = useQuery<TData, TVars & TenantVariables>(query, {
    variables: withTenant(variables, tenantId),
    fetchFirst,
    queryKey: queryKey && scopeQueryKey(tenantId, queryKey),
  })
  const { refetch, reset } = result

  const refetchForTenant = useCallback(
    (next?: TVars, replace?: boolean) => refetch(withTenant(next, tenantId), replace),
    [refetch, tenantId],
  )

  const resetForTenant = useCallback(
    (key?: string) => reset(key && scopeQueryKey(tenantId, key)),
    [reset, tenantId],
  )

  return { ...result, refetch: refetchForTenant, reset: resetForTenant }
}
