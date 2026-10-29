import type { ReactNode } from 'react'
import styles from './Notice.module.css'

type NoticeTone = 'info' | 'warning' | 'error'

interface NoticeProps {
  tone?: NoticeTone
  children: ReactNode
}

export function Notice({ tone = 'info', children }: NoticeProps) {
  return (
    <p className={styles[tone]} role={tone === 'info' ? 'status' : 'alert'}>
      {children}
    </p>
  )
}
