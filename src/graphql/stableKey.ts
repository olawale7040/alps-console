const sortKeys = (_key: string, value: unknown): unknown => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return value
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)))
}

export const stableStringify = (value: unknown): string => JSON.stringify(value, sortKeys) ?? ''

export const requestKey = (query: string, variables: object): string =>
  stableStringify({ query, variables })
