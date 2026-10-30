# ALPS console

A small slice of an operator console for a device-lifecycle platform: a searchable, paginated device list, a detail panel with its action history, and a Lock action. It runs against a mock GraphQL server in the browser, so there is no backend to set up.

The data layer is hand-written on plain `fetch`, with no data-fetching library. The reasoning behind it is in [NOTES.md](NOTES.md).

## Running it

Needs Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

Then open the URL Vite prints, usually http://localhost:5173.

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## Trying it out

- Switch tenant with the dropdown in the header. The two tenants have different devices.
- Search by serial number or IMEI, and filter by state.
- Select a device to load its detail and history.
- `SN-0000-POISON` returns partial data with errors, to show how that is handled.
- Lock a device from its detail panel. The state changes straight away and is undone if the server rejects it.

## Project structure

- `src/graphql` is the data layer: transport, request cache, `useQuery` and `useMutation`.
- `src/tenancy` holds the tenant context and the hooks that add the tenant to every request.
- `src/features/devices` is the list, detail, history and Lock feature.
- `src/mocks` is the mock server from the brief.
