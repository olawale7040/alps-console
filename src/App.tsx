import { ErrorBoundary } from './components/ErrorBoundary'
import { DevicesPage } from './DevicesPage'
import { TenantBoundary } from './tenancy/TenantBoundary'
import { TenantProvider } from './tenancy/TenantProvider'
import { TenantSwitcher } from './tenancy/TenantSwitcher'
import styles from './App.module.css'

export function App() {
  return (
    <TenantProvider>
      <header className={styles.header}>
        <h1>ALPS console</h1>
        <TenantSwitcher />
      </header>
      <main className={styles.main}>
        <TenantBoundary>
          <ErrorBoundary>
            <DevicesPage />
          </ErrorBoundary>
        </TenantBoundary>
      </main>
    </TenantProvider>
  )
}
