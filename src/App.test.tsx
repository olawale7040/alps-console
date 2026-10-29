import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, delay, graphql } from 'msw'
import { App } from './App'
import { GRAPHQL_ENDPOINT } from './graphql/fetchGraphQL'
import { server } from './mocks/server'

const WAIT = { timeout: 5000 }
const api = graphql.link(GRAPHQL_ENDPOINT)

type User = ReturnType<typeof userEvent.setup>

async function renderApp() {
  const user = userEvent.setup()
  render(<App />)
  await screen.findByRole('table', { name: 'Device list' }, WAIT)
  return user
}

const devicesPagination = () => screen.getByRole('navigation', { name: 'Devices pagination' })
const detailPanel = () => screen.getByRole('region', { name: 'Device detail' })
const historyPanel = () => within(detailPanel()).getByRole('region', { name: 'Device history' })
const serialNumbers = () =>
  screen.getAllByRole('button', { name: /^SN-/ }).map((b) => b.textContent)
const rowFor = (serial: string) => screen.getByRole('row', { name: new RegExp(serial) })

async function search(user: User, term: string) {
  const box = screen.getByRole('searchbox', { name: 'Search devices' })
  await user.clear(box)
  await user.type(box, term)
}

async function openDevice(user: User, serial: string) {
  await search(user, serial)
  await user.click(await screen.findByRole('button', { name: serial }, WAIT))
  await within(detailPanel()).findByText('Serial number', {}, WAIT)
}

beforeEach(() => {
  vi.spyOn(Math, 'random').mockReturnValue(0)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Device console', () => {
  it('shows a loading state, then only the current tenant’s devices', async () => {
    render(<App />)
    expect(screen.getByText('Loading devices…')).toBeInTheDocument()

    await screen.findByRole('table', { name: 'Device list' }, WAIT)
    expect(screen.getByRole('combobox', { name: 'Tenant' })).toHaveValue('tenant-alpha')
    expect(serialNumbers()).toHaveLength(10)
    expect(serialNumbers().every((serial) => serial?.endsWith('-A'))).toBe(true)
    expect(within(devicesPagination()).getByText('Page 1 of 5')).toBeInTheDocument()
  })

  it('narrows the list as you search by serial number or IMEI, and says when nothing matches', async () => {
    const user = await renderApp()

    await search(user, 'SN-0004')
    await waitFor(() => expect(serialNumbers()).toEqual(['SN-0004-A']), WAIT)

    await search(user, '356000000039595')
    await waitFor(() => expect(serialNumbers()).toEqual(['SN-0005-A']), WAIT)

    await search(user, 'no-such-device')
    expect(await screen.findByText('No devices match your search.', {}, WAIT)).toBeInTheDocument()
  })

  it('pages through the list, and changing a filter goes back to the first page', async () => {
    const user = await renderApp()

    await user.click(within(devicesPagination()).getByRole('button', { name: 'Next' }))
    expect(
      await within(devicesPagination()).findByText('Page 2 of 5', {}, WAIT),
    ).toBeInTheDocument()
    expect(within(devicesPagination()).getByRole('button', { name: 'Previous' })).toBeEnabled()

    await user.selectOptions(screen.getByRole('combobox', { name: 'Filter by state' }), 'LOCKED')
    expect(
      await within(devicesPagination()).findByText('Page 1 of 1', {}, WAIT),
    ).toBeInTheDocument()
    for (const row of screen.getAllByRole('row').slice(1)) {
      expect(within(row).getByText('LOCKED')).toBeInTheDocument()
    }
  })

  it('shows a device’s detail and history, and replaces them when another is selected', async () => {
    const user = await renderApp()

    await user.click(await screen.findByRole('button', { name: 'SN-0001-A' }))
    await within(detailPanel()).findByText('Galaxy S23', {}, WAIT)
    expect(await within(historyPanel()).findByText('Page 1 of 1', {}, WAIT)).toBeInTheDocument()
    expect(within(historyPanel()).getAllByRole('listitem')).toHaveLength(4)

    await user.click(screen.getByRole('button', { name: 'SN-0002-A' }))
    await within(detailPanel()).findByText('Redmi Note 13', {}, WAIT)
    expect(within(detailPanel()).queryByText('Galaxy S23')).not.toBeInTheDocument()
  })

  it('shows what it can for a partly failing device instead of a blank screen', async () => {
    const user = await renderApp()

    await openDevice(user, 'SN-0000-POISON')
    const detail = detailPanel()

    expect(within(detail).getByText('Nokia')).toBeInTheDocument()
    expect(within(detail).getAllByText('Unavailable')).toHaveLength(2)
    expect(
      within(detail).getByText(
        'Some data could not be loaded: Subscriber record unavailable; Policy service timed out',
      ),
    ).toBeInTheDocument()
  })

  it('switches to another tenant’s devices without carrying anything over', async () => {
    const user = await renderApp()
    await openDevice(user, 'SN-0001-A')

    await user.selectOptions(screen.getByRole('combobox', { name: 'Tenant' }), 'tenant-beta')

    expect(
      await screen.findByText('Select a device to see its detail and history.', {}, WAIT),
    ).toBeInTheDocument()
    expect(await screen.findByText('Page 1 of 2', {}, WAIT)).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Search devices' })).toHaveValue('')
    expect(serialNumbers().every((serial) => serial?.endsWith('-B'))).toBe(true)
    expect(screen.queryByText('SN-0001-A')).not.toBeInTheDocument()
  })

  it('locks a device straight away and confirms it once the server agrees', async () => {
    const user = await renderApp()
    await openDevice(user, 'SN-0029-A')
    expect(within(rowFor('SN-0029-A')).getByText('ACTIVE')).toBeInTheDocument()

    await user.click(
      await within(detailPanel()).findByRole('button', { name: 'Lock device' }, WAIT),
    )

    expect(within(rowFor('SN-0029-A')).getByText('LOCKED')).toBeInTheDocument()
    expect(within(detailPanel()).getByText('LOCKED')).toBeInTheDocument()

    expect(await within(detailPanel()).findByText('Device locked.', {}, WAIT)).toBeInTheDocument()
    expect(
      within(detailPanel()).queryByRole('button', { name: 'Lock device' }),
    ).not.toBeInTheDocument()
    expect(await within(historyPanel()).findByText('Lock device', {}, WAIT)).toBeInTheDocument()
    expect(within(rowFor('SN-0029-A')).getByText('LOCKED')).toBeInTheDocument()
  })

  it('puts the old state back and explains when the server rejects a lock', async () => {
    server.use(
      api.mutation('AssignAction', async () => {
        await delay(100)
        return HttpResponse.json({
          errors: [{ message: 'Device is already locked (state transition rejected)' }],
        })
      }),
    )
    const user = await renderApp()
    await openDevice(user, 'SN-0005-A')

    await user.click(
      await within(detailPanel()).findByRole('button', { name: 'Lock device' }, WAIT),
    )
    expect(within(rowFor('SN-0005-A')).getByText('LOCKED')).toBeInTheDocument()
    expect(within(detailPanel()).getByText('LOCKED')).toBeInTheDocument()

    expect(
      await within(detailPanel()).findByText(
        /Couldn't lock the device: Device is already locked/,
        {},
        WAIT,
      ),
    ).toBeInTheDocument()
    expect(within(rowFor('SN-0005-A')).getByText('ACTIVE')).toBeInTheDocument()
    expect(within(detailPanel()).getByText('ACTIVE')).toBeInTheDocument()
    expect(within(detailPanel()).getByRole('button', { name: 'Lock device' })).toBeEnabled()
  })

  it('keeps the device detail on screen when only its history fails', async () => {
    server.use(
      api.query('ListDeviceHistory', () =>
        HttpResponse.json({ errors: [{ message: 'History is down' }] }),
      ),
    )
    const user = await renderApp()

    await user.click(await screen.findByRole('button', { name: 'SN-0001-A' }))

    expect(await within(historyPanel()).findByText('History is down', {}, WAIT)).toBeInTheDocument()
    expect(await within(detailPanel()).findByText('Galaxy S23', {}, WAIT)).toBeInTheDocument()
    expect(screen.getByRole('table', { name: 'Device list' })).toBeInTheDocument()
  })
})
