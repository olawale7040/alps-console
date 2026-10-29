import { useCallback } from 'react'
import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '../graphql/useMutation'
import { useTenant } from './tenantContext'
import type { TenantVariables } from './tenants'

export function useTenantMutation<TData, TVars extends object = Record<string, never>>(
  query: string,
  { variables, throwError }: UseMutationOptions<TVars> = {},
): UseMutationResult<TData, TVars> {
  const { tenantId } = useTenant()
  const result = useMutation<TData, TVars & TenantVariables>(query, {
    variables: { ...variables, tenantId } as TVars & TenantVariables,
    throwError,
  })
  const { mutateData } = result

  const mutateForTenant = useCallback(
    (next?: TVars, replace?: boolean) =>
      mutateData({ ...next, tenantId } as TVars & TenantVariables, replace),
    [mutateData, tenantId],
  )

  return { ...result, mutateData: mutateForTenant }
}
