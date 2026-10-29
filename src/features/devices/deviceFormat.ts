import type { Imei } from './types'

const UNAVAILABLE = 'Unavailable'

export const primaryImei = (imeis: Imei[] | null): string | undefined =>
  imeis?.find((entry) => entry.isPrimary)?.imei ?? undefined

export const formatTimestamp = (value: string | null): string =>
  value ? new Date(value).toLocaleString() : '—'

export const orUnavailable = (value: string | null | undefined): string => value ?? UNAVAILABLE
