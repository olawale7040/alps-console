import type { ReactNode } from 'react'
import { Notice } from './Notice'

interface QueryViewProps {
  loading: boolean
  errors: string[]
  data: unknown
  isEmpty?: boolean
  loadingLabel: string
  emptyLabel: string
  children: ReactNode
}

export function QueryView({
  loading,
  errors,
  data,
  isEmpty = false,
  loadingLabel,
  emptyLabel,
  children,
}: QueryViewProps) {
  if (data === undefined) {
    if (errors.length > 0) return <Notice tone="error">{errors.join('; ')}</Notice>
    return loading ? <Notice>{loadingLabel}</Notice> : null
  }

  return (
    <>
      {errors.length > 0 && (
        <Notice tone="warning">Some data could not be loaded: {errors.join('; ')}</Notice>
      )}
      {isEmpty ? <Notice>{emptyLabel}</Notice> : children}
    </>
  )
}
