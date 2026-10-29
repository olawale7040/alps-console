import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, graphql } from 'msw'
import { server } from '../mocks/server'
import { GRAPHQL_ENDPOINT } from './fetchGraphQL'
import { useQuery } from './useQuery'

const SEARCH = `
  query ListDevices($tenantId: String, $serialNumber: String) {
    listDevices(tenantId: $tenantId, serialNumber: $serialNumber) {
      deviceList {
        id
      }
    }
  }
`

interface SearchData {
  listDevices: { deviceList: { id: string }[] }
}

interface SearchVariables {
  tenantId: string
  serialNumber: string
}

const shownTerm = (data: SearchData | undefined) => data?.listDevices.deviceList[0]?.id

function controlSearchResponses() {
  const waiting = new Map<string, () => void>()
  server.use(
    graphql.link(GRAPHQL_ENDPOINT).query('ListDevices', async ({ variables }) => {
      const term = String(variables.serialNumber)
      await new Promise<void>((release) => waiting.set(term, release))
      return HttpResponse.json({ data: { listDevices: { deviceList: [{ id: term }] } } })
    }),
  )
  return {
    hasRequested: (term: string) => waiting.has(term),
    respond: (term: string) => waiting.get(term)?.(),
  }
}

describe('useQuery', () => {
  it('keeps the newest result when an earlier request responds last', async () => {
    const responses = controlSearchResponses()
    const { result, rerender } = renderHook(
      ({ serialNumber }) =>
        useQuery<SearchData, SearchVariables>(SEARCH, {
          variables: { tenantId: 'tenant-alpha', serialNumber },
          fetchFirst: true,
        }),
      { initialProps: { serialNumber: 'a' } },
    )
    await waitFor(() => expect(responses.hasRequested('a')).toBe(true))

    rerender({ serialNumber: 'ab' })
    await waitFor(() => expect(responses.hasRequested('ab')).toBe(true))

    responses.respond('ab')
    await waitFor(() => expect(shownTerm(result.current.data)).toBe('ab'))

    responses.respond('a')
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(shownTerm(result.current.data)).toBe('ab')
    expect(result.current.loading).toBe(false)
  })
})
