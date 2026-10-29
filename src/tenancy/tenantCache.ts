import { evictEntries } from '../graphql/requestCache'
import type { TenantId } from './tenants'

const belongsToTenant = (variables: object, tenantId: TenantId): boolean =>
  'tenantId' in variables && variables.tenantId === tenantId

export const evictOtherTenants = (tenantId: TenantId) =>
  evictEntries(({ variables }) => !belongsToTenant(variables, tenantId))
