import { fetchGraphQL } from './fetchGraphQL'
import { requestKey } from './stableKey'
import type { QueryPayload } from './types'

export const CACHE_TTL_MS = 30_000

interface Entry {
  readonly query: string
  readonly variables: object
  readonly queryKey: string | undefined
  readonly controller: AbortController
  readonly promise: Promise<QueryPayload<unknown>>
  refs: number
  settledAt: number | null
}

export interface CachedRequest<TData> {
  readonly promise: Promise<QueryPayload<TData>>
  release: () => void
}

export interface RequestOptions {
  readonly queryKey?: string | undefined
  readonly force?: boolean
}

const entries = new Map<string, Entry>()

const isInFlight = (entry: Entry): boolean => entry.settledAt === null

const isFresh = (entry: Entry): boolean =>
  entry.settledAt !== null && Date.now() - entry.settledAt < CACHE_TTL_MS

function startRequest(
  key: string,
  query: string,
  variables: object,
  queryKey: string | undefined,
): Entry {
  const controller = new AbortController()
  const promise = fetchGraphQL<unknown>(query, variables, controller.signal).then(
    (payload) => {
      if (entries.get(key) === entry) {
        if (payload.data === undefined || payload.errors.length > 0) entries.delete(key)
        else entry.settledAt = Date.now()
      }
      return payload
    },
    (error: unknown) => {
      if (entries.get(key) === entry) entries.delete(key)
      throw error
    },
  )
  const entry: Entry = { query, variables, queryKey, controller, promise, refs: 0, settledAt: null }
  entries.set(key, entry)
  return entry
}

function abortIfAbandoned(key: string, entry: Entry) {
  if (entry.refs > 0 || !isInFlight(entry)) return
  entry.controller.abort()
  if (entries.get(key) === entry) entries.delete(key)
}

function acquire(key: string, entry: Entry): () => void {
  entry.refs += 1
  let released = false
  return () => {
    if (released) return
    released = true
    entry.refs -= 1
    queueMicrotask(() => abortIfAbandoned(key, entry))
  }
}

export function fetchCached<TData>(
  query: string,
  variables: object,
  { queryKey, force = false }: RequestOptions = {},
): CachedRequest<TData> {
  const key = requestKey(query, variables)
  const existing = entries.get(key)
  const reusable = existing && (isInFlight(existing) || (!force && isFresh(existing)))
  const entry = reusable ? existing : startRequest(key, query, variables, queryKey)

  return {
    promise: entry.promise as Promise<QueryPayload<TData>>,
    release: acquire(key, entry),
  }
}

export function cancelRequests(queryKey: string) {
  for (const [key, entry] of entries) {
    if (entry.queryKey !== queryKey || !isInFlight(entry)) continue
    entry.controller.abort()
    entries.delete(key)
  }
}

export function evictEntries(
  shouldEvict: (entry: {
    query: string
    variables: object
    queryKey: string | undefined
  }) => boolean,
) {
  for (const [key, entry] of entries) {
    if (!shouldEvict(entry)) continue
    if (isInFlight(entry)) entry.controller.abort()
    entries.delete(key)
  }
}

export function clearCache() {
  evictEntries(() => true)
}
