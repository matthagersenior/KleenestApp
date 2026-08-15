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
- The first usable GPS position on every app open triggers a fresh nearby discovery against **both Supabase/database data and OSM/Overpass data**, even when local Maps cache exists.
- Location data is cached in localStorage and exposed as `KleenestLocations`.
- Maps renders from the shared cache immediately while app-open GPS/discovery runs in the background.
- The app-open discovery merges fresh database/OSM results into the existing candidate catalog; it does not clear candidates first.
- **Only bathroom-verified records are exposed through `KleenestLocations` for the public Maps destination list.** Unverified source records are retained as `KleenestMapCandidates` for future verification/data collection.
- Candidate cache key is `kleenest.maps.candidates.v1`; public Maps cache key is `kleenest.maps.cache.v23`.
- `kleenest-map-media.js` is loaded by the preloader and fixes Leaflet's broken default marker assets with an inline Kleenest pin.
- `kleenest-map-media.js` also decorates Maps result/detail cards with a business-selected featured location photo.
- Featured photos use the existing `location_photos` table and `location-photos` Storage bucket.
- Growth and Enterprise businesses can choose a featured photo through `set_featured_location_photo`; the database enforces ownership and tier authorization.
- The modular bootstrap loads the Maps session/preloader before the app shell and now also loads the Maps control policy.
- `kleenest-maps-surface.js` remains a renderer/consumer only: it must not independently start discovery or own a second GPS lifecycle.
- The legacy `kleenest-map-discovery-bootstrap.js` is compatibility-only and delegates to the persistent preloader; it must not run an independent startup discovery pipeline.
- The manual Maps action is **Update my location**. It forces a fresh GPS position and a nearby data refresh. The separate Refresh button is intentionally removed.

## Location catalog policy — 2026-08-15
The location catalog is broader than the confirmed restroom list. Safe source categories now include gas stations/travel stops, fast food/restaurants, cafes, hospitals/healthcare, parks/recreation, retail, libraries, airports, transit, lodging, public/government, worship, financial, culture and community locations.

The rule is:
1. Source systems may create/update a location candidate.
2. Candidates carry provenance (`source`, `source_dataset`, `source_external_id`, `source_metadata`).
3. Candidates default to `bathroom_verification_status = 'unverified'`.
4. An unverified candidate is **not** presented as a confirmed bathroom destination.
5. Community/business verification can promote the candidate to `has_bathroom`, at which point it becomes eligible for the public Maps destination dataset.
6. A unique `(source_dataset, source_external_id)` index prevents repeated OSM ingestion from duplicating records.

Supabase now has an authenticated `ingest-map-candidates` Edge Function that queries OSM/Overpass and upserts candidates into `locations`. The database has lookup indexes for place type, bathroom status, and active/source combinations.

## Gamification / social contract
The existing engagement model remains part of Maps: check-ins, location visits, favorites, reviews, bathroom verification, points, levels, badges and social activity. Bathroom verification is an auditable contribution signal and should award verification points once per user/location rather than allowing repeat farming.

## Required navigation behavior
1. App opens: immediately warm GPS/location data in the background.
2. Every app-open GPS position triggers fresh Supabase/database + OSM/Overpass nearby discovery.
3. If verified Maps data exists, expose it immediately while fresh discovery runs.
4. Keep unverified candidates separate; do not clear them during refresh.
5. Navigate away from Maps: do NOT destroy the shared location/GPS state.
6. Return to Maps: mount the existing cached dataset immediately; do not prompt/re-request GPS.
7. Preserve map center, zoom, category and amenity filters where possible.
8. Background refresh updates the shared cache without clearing visible results.
9. OSM/Overpass and database results are merged and persisted rather than replacing prior candidates.
10. The Maps surface must never use a local-count threshold to decide whether to refresh; refresh policy belongs to the preloader.
11. Tapping **Update my location** must acquire a fresh GPS position and refresh nearby discovery; no second Refresh control is shown.

## Verification still required
1. Browser test cold launch and confirm GPS permission/fix begins without navigating to Maps.
2. Confirm every app open, including an open with a previously cached GPS position, triggers fresh Supabase/database + OSM/Overpass discovery.
3. Confirm cached verified results paint immediately and remain visible while fresh discovery runs.
4. Confirm candidate counts grow after authenticated OSM ingestion and that verified Maps results remain gated by bathroom confirmation.
5. Navigate Home → Maps → Home → Maps and confirm no second GPS permission/request and no duplicate app-open discovery cycle.
6. Move/zoom the map, leave Maps, return, and confirm center/zoom restore.
7. Change category/amenity, leave Maps, return, and confirm filters restore.
8. Tap **Update my location** and confirm GPS updates and both discovery sources refresh.
9. Verify background discovery does not clear existing verified pins while candidates are merged.
10. Verify real uploaded featured photos render; mock `location_photos` rows without Storage objects are not sufficient.
11. Verify Growth/Enterprise featured-photo selection after real uploads.
12. Verify bathroom verification is GPS-gated, auditable and contributes to the existing points/badges/social system without duplicate point farming.

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
