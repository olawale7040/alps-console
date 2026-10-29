import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { TenantContext } from './tenantContext'
import { evictOtherTenants } from './tenantCache'
import { DEFAULT_TENANT_ID, type TenantId } from './tenants'

interface TenantProviderProps {
  initialTenantId?: TenantId
  children: ReactNode
}

export function TenantProvider({
  initialTenantId = DEFAULT_TENANT_ID,
  children,
}: TenantProviderProps) {
  const [tenantId, setTenantId] = useState(initialTenantId)

  const switchTenant = useCallback((next: TenantId) => {
    evictOtherTenants(next)
    setTenantId(next)
  }, [])

  const value = useMemo(() => ({ tenantId, switchTenant }), [tenantId, switchTenant])

  return <TenantContext value={value}>{children}</TenantContext>
}
