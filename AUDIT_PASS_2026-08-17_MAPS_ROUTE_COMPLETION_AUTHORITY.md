# Audit Pass — Maps Route Completion Authority — 2026-08-17

## Finding

The previous navigation retry fix correctly prevented advancing past a stop when `completeStop()` failed, but the final route completion path still swallowed `routes.complete()` failures and emitted `routeCompleted: true` regardless.

That could make the UI report a completed route before the server-authoritative completion RPC succeeded.

## Fix

Final completion now follows the same authority rule as individual stops:

server completion succeeds → emit `routeCompleted` and deactivate navigation

server completion fails → emit `routeCompletionFailed` and retain the active navigation state for retry on the next GPS update

No route is represented as successfully completed solely from client state.

## Verification

No database/RLS changes were necessary. Existing `complete_route(uuid)` remains the authoritative completion operation.

Implementation commit: `e1931fec78f275c24b1bebcb46bd8265ea0d5e93`

Browser/deployed runtime execution remains the final gate.
