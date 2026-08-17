# Audit Pass — Maps Route Runtime Authority — 2026-08-17

## Finding

The active Maps route module (`cores/maps/maps-routes.js`) writes route lifecycle events directly to `route_events` for authenticated users when starting a route, completing a stop, and sharing a route. Live RLS allowed SELECT on `route_events` but had no authenticated INSERT policy.

This meant the route lifecycle could reach a real RLS denial even though the surrounding route code and `route_plans`/`route_stops` policies were correct.

## Live contract verification

- `route_plans`: RLS enabled; owner ALL policy (`user_id = auth.uid()`).
- `route_stops`: RLS enabled; owner route-scoped ALL policy.
- `route_events`: RLS enabled; owner SELECT policy existed, but INSERT was missing.
- Existing `complete_route(uuid)` RPC exists as `SECURITY DEFINER` and returns `jsonb`; its existing server-side points calculation and completion event insertion were preserved. No replacement function was created.

## Fix

Applied migration `p1_route_event_insert_authority_v1` adding an authenticated INSERT policy requiring both:

- `route_events.user_id = auth.uid()`
- the referenced route belongs to `auth.uid()`

This is the smallest contract change needed to make the active Maps route lifecycle compatible with live RLS.

The exact migration source was committed to `refactor/monolith-removal`.

## Deliberately not changed

- No client-side points calculation was introduced.
- Existing `complete_route` authority was not replaced.
- No broad route-event write permission was granted.
- No `/main` changes were made.

## Remaining verification

Authenticated end-to-end browser interaction should still verify Start → Stop completion → Share against the deployed bundle. CI is not claimed unless a workflow run exists.
