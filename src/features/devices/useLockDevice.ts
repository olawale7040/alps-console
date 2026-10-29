import { useState } from 'react'
import { errorMessage } from '../../graphql/fetchGraphQL'
import { useTenant } from '../../tenancy/tenantContext'
import { useTenantMutation } from '../../tenancy/useTenantMutation'
import { useTenantQuery } from '../../tenancy/useTenantQuery'
import { actionsQueryKey, commitDeviceState, invalidateDevice } from './deviceCache'
import { useDevicePatches } from './devicePatches'
import { LOCKED_STATE } from './deviceStates'
import { ASSIGN_ACTION, LIST_AVAILABLE_ACTIONS } from './operations'
import type {
  AssignActionData,
  AssignActionVariables,
  AvailableActionsData,
  AvailableActionsVariables,
} from './types'

export function useLockDevice(deviceId: string, stateId: number | undefined) {
  const { tenantId } = useTenant()
  const { setPatch, clearPatch } = useDevicePatches()
  const [error, setError] = useState<string>()

  const actions = useTenantQuery<AvailableActionsData, AvailableActionsVariables>(
    LIST_AVAILABLE_ACTIONS,
    {
      variables: { stateId: String(stateId) },
      fetchFirst: stateId !== undefined,
      queryKey: actionsQueryKey(deviceId),
    },
  )
  const { mutateData, loading } = useTenantMutation<AssignActionData, AssignActionVariables>(
    ASSIGN_ACTION,
    { throwError: true },
  )

  const lockAction = actions.data?.listAvailableActions?.find(
    (action) => action?.stateId === LOCKED_STATE.id,
  )

  const lock = async () => {
    if (!lockAction) return
    setError(undefined)
    setPatch(deviceId, { state: LOCKED_STATE })
    try {
      const result = await mutateData({ deviceId, actionId: lockAction.id })
      if (!result?.assignAction) throw new Error('The server did not apply the action')
      commitDeviceState(tenantId, deviceId, LOCKED_STATE)
      clearPatch(deviceId)
      invalidateDevice(tenantId, deviceId)
    } catch (failure) {
      clearPatch(deviceId)
      setError(errorMessage(failure))
    }
  }

  return { canLock: lockAction !== undefined, locking: loading, error, lock }
}
