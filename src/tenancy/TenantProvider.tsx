import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { evictEntries } from '../graphql/requestCache'
import { TenantContext } from './tenantContext'
import { DEFAULT_TENANT_ID, isTenantVariables, type TenantId } from './tenants'

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
    evictEntries(({ variables }) => !isTenantVariables(variables) || variables.tenantId !== next)
    setTenantId(next)
  }, [])

  const value = useMemo(() => ({ tenantId, switchTenant }), [tenantId, switchTenant])

  return <TenantContext value={value}>{children}</TenantContext>
}
