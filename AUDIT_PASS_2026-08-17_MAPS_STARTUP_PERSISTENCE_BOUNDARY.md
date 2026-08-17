# Audit Pass — Maps Startup OSM Persistence Boundary — 2026-08-17

**Authoritative branch:** `refactor/monolith-removal`

## Finding

Production `public.locations` is empty after removal of the six demo records. The active Maps Discovery path correctly returns live OSM rows on first load, but its persistence request derived the Edge Function bounding box solely from the returned candidate coordinates. A degenerate candidate set could therefore produce no persistence request even though the discovery operation had a valid map center/radius.

## Fix

- `maps-external-ingestion-v1.js` now accepts an authoritative discovery-area bbox.
- `bboxFromCenter()` derives a bounded persistence area from the actual Maps discovery center/radius.
- `maps-discovery-v3.js` passes that authoritative bbox whenever it persists startup OSM discovery.
- Persistence remains exclusively through the `maps-ingest` Edge Function; no client-side provenance-table mutation was introduced.
- Existing live OSM rows are still returned immediately and are not replaced by synthetic/demo data.

## Backend verification

Production was re-read before the change:

- `external_data_sources(source_key='osm')`: active.
- `maps-ingest`: ACTIVE, version 6, JWT verification enabled.
- `ingest_osm_locations(jsonb)`: SECURITY DEFINER and requires `service_role`.
- `nearby_locations_enriched(...)`: SECURITY DEFINER and reads active locations.
- Production `locations`: 0 rows at verification time.

## Commits

- `b0049332aa32b544214ad36e0394f8bcc66377aa` — authoritative persistence bbox support.
- `2210a638f48fec00b579872d7324ba4e2d1cbca4` — Maps Discovery startup persistence wiring.

## Remaining verification gate

GitHub Actions has not produced a workflow run for the latest connector commits, and browser execution is not exposed through the current connector tool surface. Therefore this pass does **not** claim deployed/browser success or a populated production database. The source-level P0 wiring is complete and the remaining gate is runtime observation.
