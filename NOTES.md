# Notes

Short answers to the questions in the brief, then a few things I noticed along the way.

## How I closed the race condition

Every `useQuery` counts its requests. When an answer comes back, it is only used if it belongs to the newest request, so a slow old answer is thrown away. Changing the variables also lets go of the old request, and it gets cancelled if nothing else is waiting for it. The debounce on the search box only makes the problem rarer, it doesn't fix it. The same code covers picking device A and then quickly picking B. The test is in `src/graphql/useQuery.test.tsx`.

## Where `tenantId` is injected, and what happens to the cache on a switch

It comes from React context (`TenantProvider`). `useTenantQuery` and `useTenantMutation` add it to every request, last, so a call site can't override it and never has to pass it.

I didn't read it from module scope or `sessionStorage`. That avoids the provider, but then the value React renders with and the value `fetch` sends can drift apart, and nothing re-renders when it changes.

The cache key includes `tenantId`, so reads are safe. But I'd call that lucky, not safe: the old tenant's entries would still sit in memory, and a late response or leftover hook state could still bring old rows back. So on a switch I also delete every cache entry that isn't the new tenant's (cancelling any request still running), and `TenantBoundary` remounts the page, which throws away all component state. A lock request already on its way can't be cancelled, but when it finishes there is nothing left to update.

## Cache TTL

30 seconds. It's long enough that going back to something you just looked at doesn't hit the network, and two components asking for the same thing at the same moment share one request. It's short enough that another operator's change shows up soon. Our own changes don't wait for it, because a lock updates the cache directly. Answers that came back with errors are never cached. There's no data behind the number. It's a judgment call and a single constant.

## How the optimistic update reaches the list row and the detail panel

The list and the detail each own their data, so neither can change the other's. I put a small layer of pending changes above both (`DevicePatchesProvider`). Pressing Lock puts the new state in there, keyed by device id, and the table rows and the detail panel both read through it, so they change together.

If the server says no, I delete that entry and show the error. Nothing has to be put back. I chose this over saving the old data and restoring it, because a restore can overwrite newer data that arrived while the request was running.

If the server says yes, I write the new state into the cached list and detail, which updates anything showing them without a request. Then I mark that device's detail and history as out of date so they reload and the new history entry appears. The list isn't reloaded.

To invalidate by device instead of by query, cache entries would need to know which devices they hold, by recording ids when a response is stored or by normalising the data. Today I can only say "refresh whatever is stored under this query key", so I named the keys like `device:<id>:detail`. One known gap: two hooks running the same query with the same variables under different keys share one entry, and it only remembers the first key.

## What a partial `data` + `errors` response shows

It shows the data. A yellow warning above it lists the errors, and the fields that came back null say "Unavailable". For `SN-0000-POISON` you see the device, a warning about the subscriber record and the policy service, and "Unavailable" next to IMSI and Policy.

The server did send good data, so throwing it away would hide things the operator can use. With no data at all, it's a red error and nothing else. This lives in one place (`QueryView`), so the list, detail and history behave the same, and one failing doesn't blank the others.

On whether a refetch clears the data: it doesn't. Old rows stay, slightly faded, until the new ones arrive, so typing doesn't flicker the table. That would be wrong across tenants, so a tenant switch remounts everything, and the detail panel is remounted for each device.

## What I left out, and what I'd do next

Left out on purpose, as the brief asks: normalised storage, cache eviction, subscriptions, refetch on focus, retry with backoff, Suspense, a router and login. The gaps I know about are marked with `TODO` in the code:

- The cache never evicts anything. I'd add a size limit.
- After a lock, only the state is written into the list row. Policy and last check-in stay old until the list reloads.
- If a lock request gets no answer at all, I roll back, but the server may have locked the device. I should refetch it instead.
- There is no retry.

Next I'd add a Retry button on errors, check server responses at runtime or generate types from the schema, take the endpoint and the mock from config, report errors somewhere, run browser tests and accessibility checks in CI, and move focus to the detail panel when you pick a device.

## Things I noticed

- The pasted `handlers.ts` had broken comment banners and lost indentation, so I fixed those. I also made type-only changes so it compiles in strict mode. The behaviour is the same.
- `msw` is pinned to version 2. Version 3 doesn't export `graphql` from the main package and needs the `graphql` package installed.
- `listDevices` joins `imei` and `serialNumber` with AND, so a search term goes to only one of them. All digits means IMEI, anything else means serial number.
- The server only rejects a lock on a device that is already locked, and the UI hides Lock for those, so the rollback is hard to see by hand. The tests force it. They also caught Lock staying clickable for a moment after a successful lock, which I fixed.
- There are two small hook tests (the race and the rollback) and a suite that uses the app the way a person would. They pin `Math.random` so the mock's delays are short and the same every run.
