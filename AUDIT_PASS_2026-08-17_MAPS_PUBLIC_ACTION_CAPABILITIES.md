# Audit Pass — Maps Public Action Capabilities — 2026-08-17

## Finding

The active Maps detail and result-card UI exposed Route, Check in, Favorite, and Verify actions for public OSM locations even though `maps-details.js` correctly reports those mutations as unavailable until the public location is verified/added to Kleenest.

The active route implementation also persists `route_stops.location_id` against the Kleenest `locations` relation, so passing an `osm:*` identifier into `addLocation()` is not a valid route mutation.

## Fix

Added `maps-action-capabilities-ui.js` and wired it into the canonical `maps-tab-core-v2.js` lifecycle.

For external `osm:*` locations it now hides/disables Kleenest-only actions in:

- detail cards: Route, Check in, Favorite, Verify
- result cards: Route, Favorite

It adds an explicit note explaining that verification into Kleenest is required before those actions become available.

Share remains available because it does not require a Kleenest location mutation.

## Authority preserved

No route schema changes were made.
No fake OSM-to-Kleenest ID conversion was added.
No client-side insert authority was added.
No public location was silently promoted into the Kleenest locations table.

## Verification

Active `maps-details.js` was inspected and confirmed to distinguish `osm:*` public data from UUID-backed Kleenest locations.
Active `maps-routes.js` was inspected and confirmed that route stops persist `location_id` against the `locations` relation.
The capability UI is wired into the active Maps Tab Core and cleaned up on destroy.

## Branch

`refactor/monolith-removal` only.