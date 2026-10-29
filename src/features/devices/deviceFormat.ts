import type { Imei } from './types'

export const primaryImei = (imeis: Imei[] | null): string | undefined =>
  imeis?.find((entry) => entry.isPrimary)?.imei ?? undefined

export const formatTimestamp = (value: string | null): string =>
  value ? new Date(value).toLocaleString() : '—'
