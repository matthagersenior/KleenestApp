# Modular Recovery Note

## Mission / purpose
The large 5,000+ line `index.html` is the **monolith reference/demo/test/upgrade source**. It is NOT the modular production runtime. The purpose is to migrate useful monolith features into maintainable modular files and expose them through one authoritative shell on `refactor/monolith-removal`.

When told to "look for the note", read this file first. Do not restart the investigation and do not replace the modular runtime with the monolith.

## Current Maps architecture
Maps is the highest-priority product surface. It must feel like an already-populated discovery map, not a page that starts over every time the user taps Maps.

- `kleenest-map-preloader.js` is the **sole persistent location-data/GPS/discovery service**.
- `kleenest-map-session.js` preserves Maps view/filter state across navigation and browser sessions.
- GPS uses one `watchPosition` watcher and a shared promise; individual Maps mounts must not request GPS again.
- **Every app open must immediately activate/warm GPS.** Do not wait for Maps navigation or a user pressing Update Location.
- The first usable GPS position on every app open must trigger a fresh nearby discovery against **both Supabase/database data and OSM/Overpass data**, even when local Maps cache exists and is still inside the normal freshness window.
- Location data is cached in localStorage and exposed as `KleenestLocations`.
- Maps renders from the shared cache immediately while app-open GPS/discovery runs in the background.
- The app-open discovery merges fresh database/OSM results into the existing cache; it does not clear cached results first.
- After the app-open discovery, normal freshness/navigation rules apply: subsequent navigation back to Maps does not re-request GPS or start a second discovery cycle.
- Background discovery merges with the existing cache and emits `kleenest:map-data-updated`; it does not clear visible results first.
- `kleenest-map-media.js` is loaded by the preloader and fixes Leaflet's broken default marker assets with an inline Kleenest pin.
- `kleenest-map-media.js` also decorates Maps result/detail cards with a business-selected featured location photo.
- Featured photos use the existing `location_photos` table and `location-photos` Storage bucket.
- Growth and Enterprise businesses can choose a featured photo through `set_featured_location_photo`; the database enforces ownership and tier authorization.
- The modular bootstrap loads the Maps session/preloader before the app shell.
- `kleenest-maps-surface.js` is a renderer/consumer only: it must not independently start discovery or own a second GPS lifecycle.
- The legacy `kleenest-map-discovery-bootstrap.js` is compatibility-only and delegates to the persistent preloader; it must not run an independent startup discovery pipeline.
- Current implementation cache key is `kleenest.maps.cache.v22`; v22 fixes app-open discovery when a cached GPS position already exists and ensures Supabase is available before the first database query.
- Current session key is `kleenest.maps.session.v1`.

## Latest Maps pass — 2026-08-15
The prior pass correctly made GPS start at app open and made the first *new* GPS fix trigger discovery, but browser testing feedback exposed two additional defects in that implementation:

1. A hydrated cached GPS position meant `position(false)` returned immediately with `firstFix === false`, so a new app-open cycle could skip fresh discovery entirely. The cache could therefore remain at the old six results.
2. The modular entry starts the preloader very early, before the shell's `core()` path necessarily loads the Supabase bridge/client. The first GPS fix could therefore launch discovery while `KleenestSupabase` was unavailable, causing the database portion to be skipped while OSM attempted independently.

Implemented in `kleenest-map-preloader.js`:
- Added a single `appOpenRefresh` promise per app-open page lifecycle.
- Every successful app-open GPS position now triggers `beginAppOpenRefresh()`, regardless of whether the position came from a hydrated cache or a newly acquired fix.
- Discovery now explicitly ensures the Supabase JS client and `kleenest-supabase.js` bridge are loaded before calling `nearbyLocations`.
- The OSM/Overpass discovery remains in the same cycle, then both sources merge with the existing cache.
- Cache version advanced to `v22` to prevent the old six-location cache contract from masking the repaired app-open behavior.
- Manual Refresh continues to acquire/reuse shared GPS before discovery.

The previous Maps fixes remain in force: the surface renders immediately from cache, has no local-count refresh threshold, session view/filter state is consumed and persisted, and the legacy discovery bootstrap is compatibility-only.

## Required navigation behavior
1. App opens: immediately warm GPS/location data in the background.
2. Every app-open GPS position triggers fresh Supabase/database + OSM/Overpass nearby discovery.
3. If local Maps data exists, expose it immediately while that fresh discovery runs.
4. Navigate away from Maps: do NOT destroy the shared location/GPS state.
5. Return to Maps: mount the existing cached dataset immediately; do not prompt/re-request GPS.
6. Preserve map center, zoom, category and amenity filters where possible.
7. Background refresh updates the shared cache without clearing visible results.
8. OSM/Overpass and database results are merged and persisted rather than replacing prior locations.
9. The Maps surface must never use a local-count threshold to decide whether to refresh; refresh policy belongs to the preloader.
10. Manual Refresh must acquire/reuse the shared GPS position and then query both discovery sources.

## Verification still required
1. Browser test cold launch and confirm GPS permission/fix begins without navigating to Maps.
2. Confirm every app open, including an open with a previously cached GPS position, triggers fresh Supabase/database + OSM/Overpass discovery.
3. Confirm cached results paint immediately and remain visible while fresh discovery runs.
4. Confirm the database query actually returns rows and the OSM/Overpass query returns rows; log/inspect both source counts if the merged result does not grow.
5. Navigate Home → Maps → Home → Maps and confirm no second GPS permission/request and no duplicate app-open discovery cycle.
6. Move/zoom the map, leave Maps, return, and confirm center/zoom restore.
7. Change category/amenity, leave Maps, return, and confirm filters restore.
8. Press Refresh before GPS is initialized and confirm it acquires/reuses shared GPS, runs both discovery sources, and increases the merged result count when sources return additional locations.
9. Verify background discovery does not clear existing pins while new results arrive.
10. Verify real uploaded featured photos render; mock `location_photos` rows without Storage objects are not sufficient.
11. Verify Growth/Enterprise featured-photo selection after real uploads.

## Non-negotiable product rules
- Branding: `Kleenest` only; never `KKleenest` or `Cleanest` in displayed app copy.
- Standard Business: basic overview stats.
- Growth+: advanced analytics, QR Studio, campaigns, promos/offers and advanced business tools.
- Owner/admin controls customization and CRUD for business-managed resources.
- QR works for every business for check-in/analytics; advanced customization is gated.
- Amenities match premium search filters; rating feedback captures good/needs-attention amenities.
- Occupancy uses fixture counts including stalls, urinals, sinks, etc.
- Photos are size-aware; authorized Growth/Enterprise businesses can upload photos and VR/360 media.
- Multi-location selection must remain available, including All Locations overview.
- Bathroom verification must be GPS-gated, auditable, and usable as a gamification/data-collection signal.
