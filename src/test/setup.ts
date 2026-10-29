import '@testing-library/jest-dom/vitest'
import { clearCache } from '../graphql/requestCache'
import { server } from '../mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  server.resetHandlers()
  clearCache()
})

afterAll(() => server.close())
