import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, graphql } from 'msw'
import type { ReactNode } from 'react'
import { GRAPHQL_ENDPOINT } from '../../../graphql/fetchGraphQL'
import { subscribeToCache } from '../../../graphql/requestCache'
import { server } from '../../../mocks/server'
import { TenantProvider } from '../../../tenancy/TenantProvider'
import { useDevicePatches } from '../patches/devicePatches'
import { DevicePatchesProvider } from '../patches/DevicePatchesProvider'
import { useLockDevice } from './useLockDevice'

const DEVICE_ID = 'dev-0001'
const ACTIVE_STATE_ID = 2

function Providers({ children }: { children: ReactNode }) {
  return (
    <TenantProvider>
      <DevicePatchesProvider>{children}</DevicePatchesProvider>
    </TenantProvider>
  )
}

function rejectLockWhenReleased() {
  let release = () => {}
  const lockRequested = new Promise<void>((resolve) => {
    server.use(
      graphql.link(GRAPHQL_ENDPOINT).mutation('AssignAction', async () => {
        resolve()
        await new Promise<void>((done) => (release = done))
        return HttpResponse.json({
          errors: [{ message: 'Device is already locked (state transition rejected)' }],
        })
      }),
    )
  })
  return { lockRequested, reject: () => release() }
}

describe('useLockDevice', () => {
  it('shows the lock straight away and takes it back when the server rejects it', async () => {
    server.use(
      graphql.link(GRAPHQL_ENDPOINT).query('ListAvailableActions', () =>
        HttpResponse.json({
          data: {
            listAvailableActions: [
              { id: 'act-lock', actionName: 'Lock device', policyName: 'Hard Lock', stateId: 3 },
            ],
          },
        }),
      ),
    )
    const pendingLock = rejectLockWhenReleased()
    const onLocked = vi.fn()
    const cacheEvents: string[] = []
    const stopListening = subscribeToCache((event) => cacheEvents.push(event.type))

    const { result } = renderHook(
      () => ({
        lock: useLockDevice(DEVICE_ID, ACTIVE_STATE_ID, onLocked),
        patches: useDevicePatches().patches,
      }),
      { wrapper: Providers },
    )
    await waitFor(() => expect(result.current.lock.canLock).toBe(true))
    expect(result.current.patches[DEVICE_ID]).toBeUndefined()

    act(() => {
      void result.current.lock.lock()
    })
    await pendingLock.lockRequested
    expect(result.current.patches[DEVICE_ID]?.state.name).toBe('LOCKED')
    expect(result.current.lock.locking).toBe(true)

    act(() => pendingLock.reject())
    await waitFor(() => expect(result.current.lock.error).toMatch(/already locked/))

    expect(result.current.patches[DEVICE_ID]).toBeUndefined()
    expect(result.current.lock.locking).toBe(false)
    expect(result.current.lock.canLock).toBe(true)
    expect(onLocked).not.toHaveBeenCalled()
    expect(cacheEvents).toEqual([])
    stopListening()
  })
})
