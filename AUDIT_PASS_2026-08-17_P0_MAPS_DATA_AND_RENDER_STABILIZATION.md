# P0 Maps Data and Render Stabilization — 2026-08-17

## Findings
- `locations` contained only 6 canonical rows, so Maps could not produce the intended geographic result set.
- `ingest-map-candidates` used `on_conflict=source_dataset,source_external_id`, but those columns had no unique constraint; ingestion could therefore fail to upsert discovered records.
- `nearby_locations` returned only a basic location projection and had no canonical amenity/fixture payload.
- Maps amenity UI used a separate hard-coded vocabulary instead of loading the authoritative `public.amenities` catalog.
- Maps initialized discovery before mounting the renderer, then mounted the renderer and refreshed discovery again, producing duplicate discovery/render cycles and pin churn.
- GPS movement thresholds were too sensitive for a stable map UX.
- The shell added a second hard-coded premium amenity selector, creating a conflicting filter surface.

## Changes
- Added unique source identity index `locations_source_identity_uidx` on `(source_dataset, source_external_id)` for non-null source identities.
- Added `nearby_locations_enriched(lat,lng,radius_meters,limit_count,required_amenity_ids)` returning canonical amenity JSON and fixture quantities.
- Upgraded `ingest-map-candidates` to version 8, with a 10-mile default radius, broader OSM/Overpass discovery, toilet/building-toilet/toilets=public coverage, and authenticated execution.
- Reworked Maps Filters to load the canonical Supabase `amenities` catalog and use fixture quantities as a separate data model.
- Reworked Maps Discovery to use the enriched RPC, ingest when fewer than 100 results are available, and use a 10-mile radius / up to 200 results.
- Reworked Maps Core to mount the renderer once, then request GPS, then perform discovery; amenity filters now use canonical amenity IDs.
- Reworked Maps Renderer to keep marker state stable, preserve selected locations, expose a visible legend, render custom pins, and remove the duplicate mount-time refresh.
- Added a canonical Maps UI patch to remove the legacy five-option premium selector.
- Bumped browser cache identity to boot 114.

## Verification
- Unique source identity index exists.
- Enriched nearby RPC exists with the expected signature.
- `ingest-map-candidates` is active with JWT verification enabled after the migration deployment.
- Current database count is still 6 locations at audit time; geographic ingestion will populate on the next authenticated Maps discovery cycle because the prior upsert contract is now corrected.
- GitHub Pages workflow checks out and deploys `refactor/monolith-removal`; `main` is reference-only.

## Acceptance gates
1. Authenticated Maps open obtains GPS and centers on the user.
2. Initial discovery does not wait for public ingestion before rendering.
3. Discovery ingests public candidates in the background path and refreshes canonical DB results.
4. 100+ appropriate locations are available when source coverage supports them.
5. Amenity filter catalog matches the canonical bathroom/business/verification amenity catalog.
6. Fixture quantities are visible in location details.
7. Marker selection survives non-material GPS movement.
8. Legend and custom pins are visible.
9. Location card Details/Route/Favorite actions execute without renderer reinitialization.
10. No duplicate premium filter UI remains.