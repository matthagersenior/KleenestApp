# Maps Discovery Enrichment Audit — 2026-08-17

**Authoritative branch:** `refactor/monolith-removal`

## Area inspected

- `cores/maps/maps-core.js`
- `cores/maps/maps-discovery.js`
- `cores/maps/maps-location.js`
- `cores/maps/maps-cache.js`

## Finding

The canonical Maps Core correctly owns location, discovery, cache, renderer, routing, navigation, and teardown. However, `maps-discovery.js` returned immediately whenever the authoritative `nearby_locations_enriched` RPC returned any rows. Public OSM/Overpass enrichment was therefore reached only when the authoritative result was empty.

That meant a successful but sparse authoritative result (for example, roughly six locations) could suppress the public-data enrichment path entirely. This matches the previously observed symptom where only a small number of locations loaded despite a larger search radius.

## Fix

Changed `cores/maps/maps-discovery.js` so that:

1. The authoritative nearby RPC remains the first source of truth.
2. Public ingestion is attempted whenever the authoritative result is below the requested result limit.
3. The authoritative RPC is re-run after ingestion.
4. If the authoritative result is still below the requested limit, live OSM/Overpass discovery is fetched.
5. Authoritative and public results are merged uniquely up to the requested limit.
6. Existing filtering and empty-result fallback behavior remain intact.

## Lifecycle review

- GPS remains owned by `createMapsLocation`.
- `watchPosition` is guarded against duplicate watches and cleared by `destroy()`.
- Discovery remains subordinate to Maps Core.
- Cache remains subordinate to Maps Core and is used as an error fallback rather than suppressing successful discovery.
- No additional Maps Core or renderer was introduced.

## Verification

- Source-level dependency path inspected directly on `refactor/monolith-removal`.
- Change committed to the authoritative branch.
- No Supabase schema, RLS, RPC definition, or authorization changes made.
- Runtime/browser verification remains required to confirm the sparse-result symptom is resolved against the live database and Overpass service.

## Commit

`6bb75bf36dacd3c359c22a4a9c399c0f8368eb48`
