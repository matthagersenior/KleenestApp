# Data Provenance — OSM Ingestion Authority Pass — 2026-08-17

## Finding
The active Maps external ingestion client called `ingest_osm_locations(jsonb)` directly. The production RPC was `SECURITY DEFINER` and had EXECUTE available to both `anon` and `authenticated`. The RPC trusted caller-supplied OSM rows and wrote authoritative `locations`, `external_location_records`, `external_observations`, and `data_feature_events` records.

This was a genuine provenance/authority defect: a public client could bypass the intended server ingestion boundary and assert arbitrary external-source data.

## Verified canonical server path
The production project already contained the authenticated `maps-ingest` Edge Function. It fetches its own OpenStreetMap/Overpass data, normalizes it, and persists through `ingest_osm_locations`.

## Fix
1. `ingest_osm_locations(jsonb)` now requires `auth.role() = 'service_role'`.
2. EXECUTE was revoked from `public`, `anon`, and `authenticated`; it is explicitly granted to `service_role`.
3. The existing `maps-ingest` Edge Function was updated to use the server service-role client for its database persistence call while retaining JWT verification at the Edge gateway.
4. The active `maps-external-ingestion-v1.js` client no longer sends arbitrary rows to the database RPC. It invokes the existing `maps-ingest` Edge Function and supplies only a bounded geographic bounding box derived from the live discovery result set. The server then performs the authoritative Overpass fetch itself.
5. The RPC additionally rejects rows whose source ID/metadata do not conform to the expected OpenStreetMap identity format before persistence.

## Verification
Production privilege check after migration:
- `anon`: EXECUTE = false
- `authenticated`: EXECUTE = false
- `service_role`: EXECUTE = true

Production function inspection confirms `ingest_osm_locations(jsonb)` remains `SECURITY DEFINER` and contains the server-authority guard.

The existing Edge Function `maps-ingest` is active at version 3 with JWT verification enabled.

## Why this is the correct boundary
The client can request geographic enrichment, but it cannot author the evidence. The server determines the external source, fetches the external dataset, normalizes the source identity, and performs the privileged persistence. This preserves the provenance chain without creating a second ingestion runtime.

## Remaining provenance work
- Inspect external observation read semantics and source metadata exposure.
- Verify contradiction handling and freshness semantics against actual consumers.
- Verify derived confidence metrics are traceable to source observations and do not silently treat external data as trusted user verification.
- Continue gamification integrity after provenance is complete.
