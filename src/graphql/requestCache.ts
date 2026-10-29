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
  payload: QueryPayload<unknown> | null
}

export type CacheEvent =
  | { readonly type: 'updated'; readonly key: string; readonly payload: QueryPayload<unknown> }
  | { readonly type: 'invalidated'; readonly queryKey: string }

export interface EntryInfo {
  readonly query: string
  readonly variables: object
  readonly queryKey: string | undefined
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
const listeners = new Set<(event: CacheEvent) => void>()

const emit = (event: CacheEvent) => listeners.forEach((listener) => listener(event))

export function subscribeToCache(listener: (event: CacheEvent) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

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
        else {
          entry.settledAt = Date.now()
          entry.payload = payload
        }
      }
      return payload
    },
    (error: unknown) => {
      if (entries.get(key) === entry) entries.delete(key)
      throw error
    },
  )
  const entry: Entry = {
    query,
    variables,
    queryKey,
    controller,
    promise,
    refs: 0,
    settledAt: null,
    payload: null,
  }
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

  const promise = entry.payload ? Promise.resolve(entry.payload) : entry.promise

  return {
    promise: promise as Promise<QueryPayload<TData>>,
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

export function evictEntries(shouldEvict: (entry: EntryInfo) => boolean) {
  for (const [key, entry] of entries) {
    if (!shouldEvict(entry)) continue
    if (isInFlight(entry)) entry.controller.abort()
    entries.delete(key)
  }
}

export function updateEntries(
  matches: (entry: EntryInfo) => boolean,
  update: (data: unknown) => unknown,
) {
  for (const [key, entry] of entries) {
    if (!entry.payload || entry.payload.data === undefined || !matches(entry)) continue
    entry.payload = { data: update(entry.payload.data), errors: entry.payload.errors }
    emit({ type: 'updated', key, payload: entry.payload })
  }
}

export function invalidateQueryKey(queryKey: string) {
  evictEntries((entry) => entry.queryKey === queryKey)
  emit({ type: 'invalidated', queryKey })
}

export function clearCache() {
  evictEntries(() => true)
}
