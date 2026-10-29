export const DEVICE_STATES = [
  { id: 1, name: 'ENROLLED' },
  { id: 2, name: 'ACTIVE' },
  { id: 3, name: 'LOCKED' },
  { id: 4, name: 'RELEASED' },
] as const

export const LOCKED_STATE = DEVICE_STATES[2]
