# Audit Pass — Maps Empty-DB Population — 2026-08-17

**Authoritative branch:** `refactor/monolith-removal`

## Verified production state

Before this pass, `public.locations` contained exactly six rows. Every row had `source='demo'`; there were zero OSM-backed locations. The six records were demo/test records, including the two original demo locations and four `Matt Test` records.

The six demo rows were removed from production. Post-delete verification:

- `locations = 0`
- `demo_locations = 0`
- `osm_locations = 0`

No non-demo location data existed in the table at the time of cleanup.

## Runtime defect

The active Maps Core loads `maps-discovery-v3.js`. Its discovery implementation queried the authoritative DB and then launched OSM discovery strictly in the background. When the authoritative DB was empty, the refresh therefore returned an empty result set on app startup. The OSM ingestion completed later, but the current map refresh did not consume those freshly discovered rows.

This was a real population gap, not a reason to restore the deleted demo fallback.

## Fix

`cores/maps/maps-discovery-v3.js` now behaves as follows:

1. Query `nearby_locations_enriched` when coordinates are available.
2. Query the canonical `locations` table.
3. Merge authoritative DB results first.
4. **If the current result set is below the requested limit and coordinates are available, await live OSM discovery for this refresh.**
5. Return those live public rows immediately so the map can populate on first load even when the database is empty.
6. Persist the discovered OSM candidates only through `maps-ingest` via `maps-external-ingestion-v1.js`.
7. When the DB already has enough rows, OSM remains background enrichment and does not block the canonical result set.

This preserves the server-side ingestion authority and does not create a client-side write path to provenance tables.

## Deleted behavior

No demo/fake fallback was restored.

## Active dependency chain

`index.html` → modular shell → canonical tab registry → `cores/maps/maps-tab-core-v2.js` → `cores/maps/maps-core.js` → `cores/maps/maps-discovery-v3.js`.

The active Maps Core does not import the legacy `maps-discovery.js` or `maps-renderer.js` generations.

## Verification

- Production demo rows removed and count rechecked.
- Active discovery source re-read after change.
- Refactor branch file re-read and confirmed to contain the empty-DB live OSM population path.
- No GitHub Actions workflow run exists for the commit, so CI is **not** claimed green.
- `/main` was not used as the product branch. An accidental default-branch write during connector invocation was immediately reverted and the original Maps discovery blob restored; the actual fix was then committed only to `refactor/monolith-removal`.

## Remaining gate

Browser/deployed-runtime verification remains required to prove that the GitHub Pages deployment has picked up the new branch bundle and that the first-load map visibly renders the live public results. No browser success is claimed until observed.
