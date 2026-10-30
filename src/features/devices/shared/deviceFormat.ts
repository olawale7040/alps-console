import type { Imei } from '../api/types'

const UNAVAILABLE = 'Unavailable'

export const primaryImei = (imeis: Imei[] | null): string | undefined =>
  imeis?.find((entry) => entry.isPrimary)?.imei ?? undefined

export const formatTimestamp = (value: string | null | undefined): string | undefined =>
  value ? new Date(value).toLocaleString() : undefined

export const valueOrUnavailable = (value: string | null | undefined): string => value ?? UNAVAILABLE
