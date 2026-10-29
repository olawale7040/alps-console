import type { GraphQLResponseBody, QueryPayload } from './types'

export const GRAPHQL_ENDPOINT = 'http://localhost:3000/graphql'

export async function fetchGraphQL<TData>(
  query: string,
  variables: object,
  signal?: AbortSignal,
): Promise<QueryPayload<TData>> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    signal: signal ?? null,
  })
  if (!response.ok) throw new Error(`Request failed (${response.status})`)

  const body: GraphQLResponseBody<TData> = await response.json()
  return {
    data: body.data ?? undefined,
    errors: (body.errors ?? []).map((error) => error.message),
  }
}

export const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError'

export const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unknown error'
