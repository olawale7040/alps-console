import styles from './Pagination.module.css'

interface PaginationProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <span>
        Page {page} of {pageCount}
      </span>
      <button type="button" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </nav>
  )
}
