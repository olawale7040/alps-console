import styles from './Pagination.module.css'

interface PaginationProps {
  label: string
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

export function Pagination({ label, page, pageCount, onPageChange }: PaginationProps) {
  return (
    <nav className={styles.pagination} aria-label={label}>
      <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <span aria-live="polite">
        Page {page} of {pageCount}
      </span>
      <button type="button" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </nav>
  )
}
