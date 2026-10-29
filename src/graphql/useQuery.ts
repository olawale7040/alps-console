import { useCallback, useEffect, useRef, useState } from 'react'
import { errorMessage, isAbortError } from './fetchGraphQL'
import { cancelRequests, fetchCached } from './requestCache'
import { useStableValue } from './useStableValue'

export interface UseQueryOptions<TVars> {
  variables?: TVars | undefined
  fetchFirst?: boolean | undefined
  queryKey?: string | undefined
}

export interface UseQueryResult<TData, TVars> {
  loading: boolean
  errors: string[]
  data: TData | undefined
  refetch: (variables?: TVars, replace?: boolean) => Promise<void>
  reset: (queryKey?: string) => void
}

interface QueryState<TData> {
  loading: boolean
  errors: string[]
  data: TData | undefined
}

const idleState = <TData>(loading: boolean): QueryState<TData> => ({
  loading,
  errors: [],
  data: undefined,
})

const startLoading = <TData>(state: QueryState<TData>): QueryState<TData> =>
  state.loading ? state : { ...state, loading: true }

const noop = () => {}

export function useQuery<TData, TVars extends object = Record<string, never>>(
  query: string,
  { variables, fetchFirst = false, queryKey }: UseQueryOptions<TVars> = {},
): UseQueryResult<TData, TVars> {
  const request = useStableValue({ query, queryKey, variables })
  const [state, setState] = useState<QueryState<TData>>(() => idleState(fetchFirst))
  const [observedRequest, setObservedRequest] = useState(request)
  const latestRequest = useRef(0)
  const releaseRequest = useRef(noop)

  if (observedRequest !== request) {
    setObservedRequest(request)
    if (fetchFirst) setState(startLoading)
  }

  const abandonRequest = useCallback(() => {
    latestRequest.current += 1
    releaseRequest.current()
    releaseRequest.current = noop
  }, [])

  const execute = useCallback(
    async (requestVariables: TVars | undefined, force: boolean) => {
      abandonRequest()
      const requestId = latestRequest.current
      const isLatest = () => requestId === latestRequest.current

      const cached = fetchCached<TData>(request.query, requestVariables ?? {}, {
        queryKey: request.queryKey,
        force,
      })
      releaseRequest.current = cached.release

      try {
        const { data, errors } = await cached.promise
        if (isLatest()) setState({ data, errors, loading: false })
      } catch (error) {
        if (!isLatest()) return
        if (isAbortError(error)) setState((previous) => ({ ...previous, loading: false }))
        else setState({ data: undefined, errors: [errorMessage(error)], loading: false })
      }
    },
    [request, abandonRequest],
  )

  useEffect(() => {
    if (fetchFirst) void execute(request.variables, false)
  }, [fetchFirst, execute, request])

  useEffect(() => abandonRequest, [abandonRequest])

  const refetch = useCallback(
    (next?: TVars, replace = false) => {
      setState(startLoading)
      return execute(replace ? next : ({ ...request.variables, ...next } as TVars), true)
    },
    [execute, request],
  )

  const reset = useCallback(
    (targetKey: string | undefined = request.queryKey) => {
      abandonRequest()
      if (targetKey) cancelRequests(targetKey)
      setState(idleState(false))
    },
    [request, abandonRequest],
  )

  return { ...state, refetch, reset }
}
