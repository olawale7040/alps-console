import { createContext, useContext } from 'react'
import type { TenantId } from './tenants'

export interface TenantContextValue {
  readonly tenantId: TenantId
  readonly switchTenant: (tenantId: TenantId) => void
}

export const TenantContext = createContext<TenantContextValue | null>(null)

export function useTenant(): TenantContextValue {
  const tenant = useContext(TenantContext)
  if (!tenant) throw new Error('useTenant must be used within <TenantProvider>')
  return tenant
}
