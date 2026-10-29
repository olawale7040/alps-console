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
  const hasData = data !== undefined
  const hasErrors = errors.length > 0
  const failed = !hasData && hasErrors
  const partial = hasData && hasErrors

  if (failed) return <Notice tone="error">{errors.join('; ')}</Notice>
  if (!hasData) return loading ? <Notice>{loadingLabel}</Notice> : null

  return (
    <>
      {partial && (
        <Notice tone="warning">Some data could not be loaded: {errors.join('; ')}</Notice>
      )}
      {isEmpty ? <Notice>{emptyLabel}</Notice> : children}
    </>
  )
}
