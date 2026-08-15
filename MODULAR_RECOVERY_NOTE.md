# Modular Recovery Note

## Mission / purpose
The large 5,000+ line `index.html` is the **monolith reference/demo/test/upgrade source**. It is NOT the modular production runtime. The purpose is to migrate useful monolith features into maintainable modular files and expose them through one authoritative shell on `refactor/monolith-removal`.

When told to "look for the note", read this file first. Do not restart the investigation and do not replace the modular runtime with the monolith.

## Current Maps architecture
Maps is the highest-priority product surface. It must feel like an already-populated discovery map, not a page that starts over every time the user taps Maps.

- `kleenest-map-preloader.js` is the persistent location-data service.
- `kleenest-map-session.js` preserves Maps view/filter state across navigation and browser sessions.
- GPS uses one `watchPosition` watcher and a shared promise; individual Maps mounts must not request GPS again.
- Location data is cached in localStorage and exposed as `KleenestLocations`.
- Cached data is shown immediately; Supabase + OSM/Overpass refresh happens in the background after the freshness window.
- `kleenest-map-media.js` is loaded by the preloader and fixes Leaflet's broken default marker assets with an inline Kleenest pin.
- `kleenest-map-media.js` also decorates Maps result/detail cards with a business-selected featured location photo.
- Featured photos use the existing `location_photos` table and `location-photos` Storage bucket.
- Growth and Enterprise businesses can choose a featured photo through `set_featured_location_photo`; the database enforces ownership and tier authorization.
- The modular bootstrap loads the Maps session/preloader before the app shell.
- The Maps surface must consume the shared cache rather than independently starting a new discovery/GPS process.
- Current local cache key is `kleenest.maps.cache.v11`; location data may be shown for up to 7 days while fresh network data refreshes after 15 minutes.
- Current session key is `kleenest.maps.session.v1`.

### Required navigation behavior
1. App opens: warm GPS/location data in the background.
2. If local Maps data exists, expose it immediately.
3. Navigate away from Maps: do NOT destroy the shared location/GPS state.
4. Return to Maps: mount the existing cached dataset immediately; do not prompt/re-request GPS.
5. Preserve map center, zoom, category and amenity filters where possible.
6. Background refresh updates the shared cache without clearing visible results.
7. OSM/Overpass and database results are merged and persisted rather than replacing prior locations.

### Visual standard
The polished Maps buttons/chips are now the reference control language for the entire app: rounded controls, strong active states, depth/shadows, icons, hierarchy, mobile horizontal scrolling and clear press/hover feedback. Future modular surfaces should reuse this visual approach.

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

## Next work — do as many tasks per pass as possible
1. Verify Maps navigation does not repeat GPS/loading when returning to the tab.
2. Verify local cache appears immediately on a cold browser launch before network discovery finishes.
3. Verify background refresh merges new OSM/Overpass and Supabase locations without clearing existing pins.
4. Verify real uploaded location photos render correctly and the Growth/Enterprise featured-photo picker can select them.
5. Connect the existing Business media upload UI to `location_photos` + `location-photos` Storage so businesses can upload/manage the photos they will choose as featured.
6. Reconnect durable Social/Game points, contests and rewards.
7. Verify Business/Admin rich mounts and datasets after identity hydration.
8. Reconnect QR Studio + advanced CRUD with Growth+/owner/admin gating.
9. Reconnect Photos/Media/VR, Partnerships, Campaigns, Promos/Offers, Events, Reviews/Replies and amenities.
10. Apply the polished Maps button/chip language throughout the remaining modular surfaces.
11. Never restore the monolithic renderer as the modular runtime.

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