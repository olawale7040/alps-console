import { useTenant } from './tenantContext'
import { TENANT_IDS, type TenantId } from './tenants'

const isTenantId = (value: string): value is TenantId => TENANT_IDS.some((id) => id === value)

export function TenantSwitcher() {
  const { tenantId, switchTenant } = useTenant()

  return (
    <label>
      Tenant{' '}
      <select
        value={tenantId}
        onChange={(event) => {
          if (isTenantId(event.target.value)) switchTenant(event.target.value)
        }}
      >
        {TENANT_IDS.map((id) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>
    </label>
  )
}
