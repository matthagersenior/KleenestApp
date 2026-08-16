# Full App Audit — Pass: Maps discovery and persistence

Branch: `refactor/monolith-removal`

## Completed

### 1. Live discovery fallback

`cores/maps/maps-discovery.js` now uses the deployed JWT-protected `ingest-map-candidates` Edge Function when a coordinate-based `nearby_locations` query returns no rows. It then retries the authoritative `nearby_locations` RPC after ingestion.

This closes the previously observed failure mode where GPS worked but the Maps surface remained empty because the local `locations` dataset had no nearby rows.

The ingestion function is production-active and pulls OSM/Overpass candidates into the Supabase `locations` dataset, including gas stations, fast food/restaurants, cafes, health facilities, libraries, parks, public restrooms, retail, transit, lodging and public facilities.

### 2. Durable map cache

`cores/maps/maps-cache.js` now persists location results to browser localStorage with a versioned key and TTL while retaining an in-memory fast path and safe storage-failure fallback.

This means a previously populated map can render from a fresh persisted cache across app launches instead of requiring a cold network discovery every time.

## Authority/security

- Supabase `nearby_locations` remains the authoritative discovery read path.
- OSM ingestion remains server-side in the deployed Edge Function.
- The Edge Function requires JWT authentication.
- Persisted candidates remain Supabase data rather than becoming client-only map records.
- Client-side filters are presentation/discovery filters, not authorization controls.

## Remaining Maps audit

- Verify the Maps Core actually consumes the cache module on every discovery path.
- Verify GPS startup occurs once and survives tab/navigation transitions.
- Verify verification/check-in/visit/favorite/progression actions use their authoritative RPCs.
- Verify map empty/error/loading states are distinct and actionable.
- Verify all location types surfaced by ingestion have intentional UI treatment.
- Verify duplicate OSM candidates are reconciled by `source_dataset/source_external_id`.
- Verify production RLS/indexes for the location workload before broadening ingestion radius or frequency.
