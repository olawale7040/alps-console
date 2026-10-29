import { useState } from 'react'
import { stableStringify } from './stableKey'

export function useStableValue<T>(value: T): T {
  const key = stableStringify(value)
  const [held, setHeld] = useState({ key, value })
  if (held.key === key) return held.value
  setHeld({ key, value })
  return value
}
