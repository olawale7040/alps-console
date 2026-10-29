import type { ChangeEvent } from 'react'
import { useTenant } from './tenantContext'
import { TENANT_IDS, type TenantId } from './tenants'

const isTenantId = (value: string): value is TenantId => TENANT_IDS.some((id) => id === value)

export function TenantSwitcher() {
  const { tenantId, switchTenant } = useTenant()

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target
    if (isTenantId(value)) switchTenant(value)
  }

  return (
    <label>
      Tenant{' '}
      <select value={tenantId} onChange={handleChange}>
        {TENANT_IDS.map((id) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>
    </label>
  )
}
