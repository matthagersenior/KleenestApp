# Modular Recovery Note

## Mission / purpose
The large 5,000+ line `index.html` is the **monolith reference/demo/test/upgrade source**. It is NOT the modular production runtime. The purpose is to migrate useful monolith features into maintainable modular files and expose them through one authoritative shell on `refactor/monolith-removal`.

When told to "look for the note", read this file first. Do not restart the investigation and do not replace the modular runtime with the monolith.

## Current Maps architecture
Maps is the highest-priority product surface. It must feel like an already-populated discovery map, not a page that starts over every time the user taps Maps.

- `kleenest-map-preloader.js` is the **sole persistent location-data/GPS/discovery service**.
- `kleenest-map-session.js` preserves Maps view/filter state across navigation and browser sessions.
- GPS uses one `watchPosition` watcher and a shared promise; individual Maps mounts must not request GPS again.
- Location data is cached in localStorage and exposed as `KleenestLocations`.
- Maps renders from the shared cache immediately; the preloader owns background Supabase + OSM/Overpass refresh after the freshness window.
- Background discovery merges with the existing cache and emits `kleenest:map-data-updated`; it does not clear visible results first.
- `kleenest-map-media.js` is loaded by the preloader and fixes Leaflet's broken default marker assets with an inline Kleenest pin.
- `kleenest-map-media.js` also decorates Maps result/detail cards with a business-selected featured location photo.
- Featured photos use the existing `location_photos` table and `location-photos` Storage bucket.
- Growth and Enterprise businesses can choose a featured photo through `set_featured_location_photo`; the database enforces ownership and tier authorization.
- The modular bootstrap loads the Maps session/preloader before the app shell.
- `kleenest-maps-surface.js` is a renderer/consumer only: it must not independently start discovery or own a second GPS lifecycle.
- The legacy `kleenest-map-discovery-bootstrap.js` is compatibility-only and delegates to the persistent preloader; it must not run an independent startup discovery pipeline.
- Current implementation cache key is `kleenest.maps.cache.v20` after the manual-refresh/GPS orchestration fix; old cache versions are intentionally not reused by the repaired service.
- Current session key is `kleenest.maps.session.v1`.

### Bathroom verification architecture
- `public.location_bathroom_verifications` records geofenced public-bathroom votes.
- `public.location_verification_points` records gamification points for verification activity.
- `public.locations` now tracks `bathroom_verification_status`, positive/negative counts, total count and verification time.
- `get_location_bathroom_verification(location_id)` returns consensus state and automatically recognizes business owner/admin membership.
- `record_bathroom_verification(location_id, has_public_bathroom, latitude, longitude)` enforces GPS presence and the location's geofence in the database.
- Premium/Pro/Growth/Enterprise users can make a direct verification; standard/free users contribute to a three-matching-vote consensus.
- Business owners/managers/admins are automatically trusted for locations attached to their business membership.
- A location reaching `not_a_bathroom` is removed from nearby Maps results.
- Verification activity awards points and creates a durable leaderboard-ready ledger.
- `kleenest-bathroom-verification.js` provides the first detail-page action: verify whether the location actually has a public bathroom.

### Required navigation behavior
1. App opens: warm GPS/location data in the background.
2. If local Maps data exists, expose it immediately.
3. Navigate away from Maps: do NOT destroy the shared location/GPS state.
4. Return to Maps: mount the existing cached dataset immediately; do not prompt/re-request GPS.
5. Preserve map center, zoom, category and amenity filters where possible.
6. Background refresh updates the shared cache without clearing visible results.
7. OSM/Overpass and database results are merged and persisted rather than replacing prior locations.
8. The Maps surface must never use a local-count threshold to decide whether to refresh; refresh policy belongs to the preloader.

## Visual standard
The polished Maps buttons/chips are now the reference control language for the entire app: rounded controls, strong active states, depth/shadows, icons, hierarchy, mobile horizontal scrolling and clear press/hover feedback. Future modular surfaces should reuse this visual approach.

## Social visual architecture
- `kleenest-social-polish.js` is loaded by the authoritative shell before the Social/Game surface mounts.
- Social/Game controls should use the same polished Maps language: rounded buttons, active gradients, depth/shadows, chips and polished form controls.
- Do not replace the existing Social/Game feature logic; this layer is visual only.

## Media / featured-photo architecture
- `public.location_photos` already existed and now has `is_featured boolean`.
- A partial unique index allows only one featured photo per location.
- `public.set_featured_location_photo(location_id, photo_id)` enforces Growth/Enterprise plus owner/admin authorization.
- Existing public Storage bucket: `location-photos` (JPEG/PNG/WebP, 12 MB limit).
- Existing photo rows currently include four Enterprise demo records whose `storage_path` values are mock paths with no corresponding Storage objects. Do not treat those mock rows as real uploaded media; upload real objects before expecting the featured image to render.
- Featured photos should appear in Maps cards, Maps details, search results and future location previews.

## Existing feature sources to keep migrating/reusing
- `f219de80` — advanced QR + business CRUD controls
- `636fe781` — authoritative Business workspace + analytics
- `c6f9a625` — modular Game Center / `kleenest-engagement.js`
- `b3673dc` — Social + Media services
- `cb024e8c` — centralized account/business loading
- `1c70c6c` — navigation controller
- `c12b3aa` — notification UI controller
- `6461875b` — Business renderer
- `9f03f53` — Business action layer
- `ef99c58` — Rewards loading
- `8c775b3` — secure business data layer
- `ce4895` — reconciled business data/state wiring
- `37a0b8a1` — QR/business advanced-control source

## Latest Maps pass — 2026-08-15
Investigation found three orchestration regressions: the Maps surface waited for `preloader.load()` before rendering, it independently forced refresh when fewer than 20 locations existed, and the legacy discovery bootstrap could independently initiate a second discovery lifecycle. The session controller also persisted center/zoom/filters but the renderer did not fully consume those values.

Implemented on `refactor/monolith-removal`:
- `kleenest-map-preloader.js` is now explicitly the sole data/GPS owner; cache-first behavior is preserved and map media is loaded by the preloader.
- `kleenest-maps-surface.js` now renders immediately from the shared cache, restores session center/zoom/filters, saves Leaflet `moveend`, saves category/amenity changes through `KleenestMapSession`, and no longer has its own geolocation fallback or `<20` refresh trigger.
- `kleenest-map-discovery-bootstrap.js` is now a compatibility bridge that delegates to the preloader rather than performing independent Supabase/local discovery.
- Manual Maps Refresh now calls `preloader.refreshWithLocation(true)`, so Refresh acquires/reuses the shared GPS position before starting Supabase + OSM/Overpass discovery. Previously, Refresh could fail silently when no GPS position existed yet because `preloader.refresh()` requires a location.
- Cache version was intentionally advanced to `v20` to prevent stale pre-fix cache state from being mistaken for the repaired cache contract.

## Verification still required
1. Browser test cold launch with cached locations and confirm Maps paints before network discovery completes.
2. Navigate Home → Maps → Home → Maps and confirm no second GPS permission/request and no duplicate discovery pipeline.
3. Move/zoom the map, leave Maps, return, and confirm center/zoom restore.
4. Change category/amenity, leave Maps, return, and confirm filters restore.
5. Press **Refresh** before GPS is initialized and confirm it acquires/reuses shared GPS, runs both discovery sources, and increases the merged result count when sources return additional locations.
6. Verify background discovery does not clear existing pins while new results arrive.
7. Verify real uploaded featured photos render; mock `location_photos` rows without Storage objects are not sufficient.
8. Verify Growth/Enterprise featured-photo selection after real uploads.

## Next work — do as many tasks per pass as possible
1. Complete the browser verification above.
2. Verify real uploaded location photos render correctly and the Growth/Enterprise featured-photo picker can select them.
3. Connect the existing Business media upload UI to `location_photos` + `location-photos` Storage so businesses can upload/manage the photos they will choose as featured.
4. Reconnect durable Social/Game points, contests and rewards.
5. Verify Business/Admin rich mounts and datasets after identity hydration.
6. Reconnect QR Studio + advanced CRUD with Growth+/owner/admin gating.
7. Reconnect Photos/Media/VR, Partnerships, Campaigns, Promos/Offers, Events, Reviews/Replies and amenities.
8. Apply the polished Maps button/chip language throughout the remaining modular surfaces.
9. Never restore the monolithic renderer as the modular runtime.

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
