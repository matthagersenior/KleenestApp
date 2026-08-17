# Audit Pass — Maps Population + Confidence Wiring — 2026-08-17

## Verified active chain

`maps-tab-core-v2.js` → `maps-core.js` → `maps-discovery-v3.js` + `maps-renderer-v2.js`.

Maps Core mounts the renderer, starts the location watcher, and calls `requestLocationAndRefresh()` during startup. The renderer consumes `state.locations` and hydrates confidence through the canonical `kleenest_location_confidence` RPC.

## Population defect fixed

The live database contained six demo records and no OSM records. Those demo records were removed from live `public.locations`.

Discovery previously returned authoritative/database rows immediately while OSM discovery ran only in the background. With an empty database, startup therefore returned an empty result before the first public-data ingestion could be consumed.

`maps-discovery-v3.js` now performs live OSM discovery before returning when authoritative results are insufficient, merges those public rows into the immediate result, and persists them through the existing server-side ingestion authority. When the database already has enough rows, OSM remains background enrichment.

## Permission-denied behavior

`maps-core.js` now explicitly treats location-permission failure as `live database/public discovery`, rather than implying that discovery is limited to stored database rows. This keeps startup capable of public-data population without device coordinates.

## Confidence consumer verified

`maps-renderer-v2.js` is the active UI consumer of `kleenest_location_confidence`.

For UUID-backed locations it calls the RPC with `p_location_id` and renders the returned score, level, and contradiction factor in the location-card trust badge.

No confidence-weight changes were made.

Confidence failures remain non-fatal and do not manufacture a score. A missing RPC result renders `Confidence unavailable`; the cache is only populated after a real RPC row is returned, so transient failures can retry on a later refresh.

## Source of truth

No demo fallback was reintroduced.
No speculative confidence calculation was added.
No client-side provenance mutation authority was introduced.
No `/main` changes are treated as product changes.

## Verification limitation

GitHub Actions currently reports no workflow run associated with the relevant commits, so CI success is not claimed. Browser-level verification against the deployed GitHub Pages bundle remains the final gate for Maps population/rendering.
