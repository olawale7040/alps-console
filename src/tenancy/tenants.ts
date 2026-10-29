export const TENANT_IDS = ['tenant-alpha', 'tenant-beta'] as const
export type TenantId = (typeof TENANT_IDS)[number]

export const DEFAULT_TENANT_ID: TenantId = 'tenant-alpha'

export interface TenantVariables {
  readonly tenantId: TenantId
}

export const scopeQueryKey = (tenantId: TenantId, queryKey: string): string =>
  `${tenantId}:${queryKey}`

export const isTenantVariables = (variables: object): variables is TenantVariables =>
  'tenantId' in variables
