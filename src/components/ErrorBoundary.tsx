import { Component, type ReactNode } from 'react'
import { Notice } from './Notice'

interface ErrorBoundaryState {
  failed: boolean
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  override render() {
    if (this.state.failed) {
      return <Notice tone="error">Something went wrong. Reload the page to try again.</Notice>
    }
    return this.props.children
  }
}
