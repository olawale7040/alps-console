import { useCallback, useRef, useState } from 'react'
import { errorMessage, fetchGraphQL, GraphQLRequestError } from './fetchGraphQL'
import { useStableValue } from './useStableValue'

export interface UseMutationOptions<TVars> {
  variables?: TVars | undefined
  throwError?: boolean | undefined
}

export interface UseMutationResult<TData, TVars> {
  loading: boolean
  errors: string[]
  mutateData: (variables?: TVars, replace?: boolean) => Promise<TData | undefined>
}

export function useMutation<TData, TVars extends object = Record<string, never>>(
  query: string,
  { variables, throwError = false }: UseMutationOptions<TVars> = {},
): UseMutationResult<TData, TVars> {
  const configuredVariables = useStableValue(variables)
  const [state, setState] = useState({ loading: false, errors: [] as string[] })
  const pending = useRef(0)

  const finish = useCallback((errors: string[]) => {
    pending.current -= 1
    setState({ loading: pending.current > 0, errors })
  }, [])

  const mutateData = useCallback(
    async (next?: TVars, replace = false) => {
      const requestVariables = replace ? next : { ...configuredVariables, ...next }
      pending.current += 1
      setState({ loading: true, errors: [] })

      try {
        const { data, errors } = await fetchGraphQL<TData>(query, requestVariables ?? {})
        if (throwError && errors.length > 0) throw new GraphQLRequestError(errors)
        finish(errors)
        return data
      } catch (error) {
        finish(throwError ? [] : [errorMessage(error)])
        if (throwError) throw error
        return undefined
      }
    },
    [query, throwError, configuredVariables, finish],
  )

  return { ...state, mutateData }
}
