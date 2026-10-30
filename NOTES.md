# Notes

## How I closed the race condition

Every `useQuery` numbers its requests, and a response is only used if it belongs to the newest one, so a slow old answer is thrown away. Changing the variables also lets go of the old request, which is cancelled if nobody else is waiting for it. The search debounce only makes the problem rarer. The same code handles picking device A and then quickly picking B. The test is in `src/graphql/useQuery.test.tsx`.

## Where `tenantId` is injected, and what happens to the cache on a switch

It comes from React context. `useTenantQuery` and `useTenantMutation` add it to every request, last, so no call site passes it or can override it. I didn't read it from module scope or `sessionStorage`, because then the value React renders with and the value `fetch` sends can drift apart, and nothing re-renders when it changes.

The cache key includes `tenantId`, so reads are safe, but I'd call that lucky: the old tenant's entries would still sit in memory, and a late response or leftover hook state could bring old rows back. So on a switch I delete every cache entry that isn't the new tenant's (cancelling anything still running) and remount the page, which throws away all component state.

## Cache TTL

30 seconds. It's long enough that going back to something you just saw doesn't hit the network, and two components asking for the same thing share one request. It's short enough that another operator's change shows up soon. Our own changes don't wait for it, because a lock updates the cache directly. It's a judgment call, not a measured number. Answers that came back with errors aren't cached.

## How the optimistic update reaches the list row and the detail panel

The list and the detail each own their data, so I put a small layer of pending changes above both (`DevicePatchesProvider`). Pressing Lock writes the new state there, and the table rows and the detail panel both read through it, so they change together.

If the server says no, I delete the entry and show the error. I chose that over restoring a saved copy, because a restore could overwrite newer data that arrived in the meantime. If it says yes, I write the new state into the cached list and detail, and mark that device's detail and history as out of date so they reload. The list isn't reloaded.

To invalidate by device instead of by query, cache entries would need to know which devices they hold, by recording the ids or by normalising. Today I can only refresh by query key, so I named keys like `device:<id>:detail`. One gap: two hooks running the same query under different keys share one entry that only remembers the first key.

## What a partial `data` + `errors` response shows

The data, with a yellow warning listing the errors. Fields that came back null say "Unavailable", which for `SN-0000-POISON` is IMSI and Policy. The server sent good data, so dropping it would hide things the operator can use. No data at all is a red error. `QueryView` does this for the list, detail and history, so one failing doesn't blank the others.

A refetch keeps the old rows, faded, so typing doesn't flicker. Switching tenant or device remounts, so old rows never show under the wrong one.

## What I left out, and what I'd do next

Skipped on purpose, as the brief asks: normalised storage, eviction, subscriptions, refetch on focus, retry with backoff, Suspense, a router and login. The known gaps are marked `TODO` in the code: the cache never evicts, only the state is written into the list row after a lock, and a lock that gets no response is rolled back even though the server may have applied it.

Next I'd add a Retry button, check responses at runtime, move the endpoint and the mock into config, and add browser and accessibility tests in CI.

## Things I noticed

- The pasted `handlers.ts` had broken comments and no indentation. I fixed that and made type-only changes for strict mode. The behaviour is the same.
- `msw` is pinned to version 2, because version 3 no longer exports `graphql` from the main package.
- `listDevices` joins `imei` and `serialNumber` with AND, so a search term goes to one of them: all digits is an IMEI, anything else is a serial number.
- The server only rejects locking a device that is already locked, and the UI hides Lock for those, so the tests force the rollback.
