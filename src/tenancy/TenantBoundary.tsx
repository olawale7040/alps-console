import { Fragment, type ReactNode } from 'react'
import { useTenant } from './tenantContext'

export function TenantBoundary({ children }: { children: ReactNode }) {
  const { tenantId } = useTenant()
  return <Fragment key={tenantId}>{children}</Fragment>
}
