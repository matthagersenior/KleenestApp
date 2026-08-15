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
- The first usable GPS position on every app open triggers fresh nearby discovery against both Supabase/database data and OSM/Overpass data.
- Location data is cached in localStorage and exposed as `KleenestLocations`.
- Maps renders from the shared cache immediately while discovery runs in the background.
- Only bathroom-verified records are exposed through `KleenestLocations`; unverified source records are retained as `KleenestMapCandidates`.
- Public Maps rendering is bounded before marker creation so a large source response cannot lock the UI.
- Candidate storage is bounded separately from public restroom results.
- The manual Maps action is **Update my location** and is the only manual location refresh control. It gets a fresh GPS position and refreshes nearby data.

## Location catalog policy — 2026-08-15
Safe candidate categories include gas stations/travel stops, fast food/restaurants, cafes, hospitals/healthcare, parks/recreation, retail, libraries, airports, transit, lodging, public/government, worship, financial, culture and community locations.

Source records may be stored as candidates with provenance (`source`, `source_dataset`, `source_external_id`, `source_metadata`) and `bathroom_verification_status = 'unverified'`. They must not be presented as confirmed bathrooms until community/business verification promotes them to `has_bathroom`.

Supabase has an authenticated `ingest-map-candidates` Edge Function for OSM/Overpass candidate ingestion/upsert, plus source deduplication and lookup indexes.

## Gamification / social contract
The Maps ecosystem includes check-ins, location visits, favorites, reviews, bathroom verification, points, levels, badges and social activity. Bathroom verification is an auditable contribution signal and should award verification points once per user/location rather than allowing repeat farming.

## Latest Maps lockup investigation — 2026-08-15
User reported twice that **the app becomes unresponsive after app open and switching to Maps**, even after bounding OSM/Overpass and public marker counts.

The deeper issue was identified in the navigation architecture: the normal shell Maps path performed `core()` and `hydrateIdentity()` before mounting Maps, and also loaded the bathroom-verification module before the Maps renderer. That meant Maps could wait on unrelated Supabase session/profile/membership/subscription work. The shell also awaited Maps mounting and Leaflet initialization.

### Fix implemented
- Added `kleenest-map-navigation-guard.js`.
- The guard captures Maps navigation clicks before the shell's normal bubble handler and opens the Maps surface directly.
- Maps navigation no longer waits for identity/business/subscription hydration.
- Maps navigation no longer waits for the bathroom-verification module.
- Reworked `kleenest-maps-surface.js` to a non-blocking mount: it creates the Maps UI synchronously, then defers Leaflet/network initialization.
- Leaflet initialization errors are contained inside Maps rather than propagating into the app navigation lifecycle.
- Public rendering is bounded at 100 records in the new surface.
- Shared GPS/cache data is used immediately.
- The single `Update my location` control remains the manual GPS/refresh action.
- The modular bootstrap now loads the navigation guard after the shell.

## Required navigation behavior
1. App opens: immediately warm GPS/location data in the background.
2. Every app-open GPS position triggers fresh Supabase/database + OSM/Overpass nearby discovery.
3. If verified Maps data exists, expose it immediately while fresh discovery runs.
4. Keep unverified candidates separate; do not clear them during refresh.
5. Navigate away from Maps: do NOT destroy shared location/GPS state.
6. Return to Maps: the fast navigation path mounts the cached dataset immediately and does not wait for identity/business hydration.
7. Preserve map center, zoom, category and amenity filters where possible.
8. Background refresh updates the shared cache without clearing visible results.
9. OSM/Overpass and database results are merged and persisted rather than replacing prior candidates.
10. The Maps surface must never use a local-count threshold to decide whether to refresh; refresh policy belongs to the preloader.
11. Tapping **Update my location** acquires fresh GPS and refreshes nearby discovery.
12. Leaflet/network initialization must never be awaited by the shell's navigation lifecycle.

## Verification still required
1. Cold launch: confirm GPS starts without navigating to Maps.
2. App open with cached GPS: confirm fresh database + OSM/Overpass discovery occurs.
3. Switch Home → Maps and confirm the UI remains responsive immediately.
4. Confirm Maps paints its shell before slow network/identity work.
5. Confirm background discovery does not clear visible verified pins.
6. Confirm candidate counts can grow without public marker rendering exceeding the cap.
7. Confirm Update my location acquires fresh GPS and refreshes both sources.
8. Navigate Home → Maps → Home → Maps and confirm no duplicate GPS lifecycle or blocking initialization.
9. Confirm map center/zoom and category/amenity filters persist.
10. Verify bathroom verification remains GPS-gated, auditable and connected to points/badges/social rewards.

## Latest commits
- `cf067b4e9b15bfa1a2ab72a7fd88286ff081bf20` — Maps surface v47: non-blocking mount and isolated Leaflet initialization.
- `1a6280ed93a9437a3891754e5e653b3dfd89e81e` — Maps navigation guard: bypass blocking shell hydration.
- `0380949c214728d3b0043b1067018281dfabd044` — modular entry loads the fast Maps navigation path.

## Non-negotiable product rules
- Branding: `Kleenest` only.
- Standard Business: basic overview stats.
- Growth+: advanced analytics, QR Studio, campaigns, promos/offers and advanced business tools.
- Owner/admin controls customization and CRUD for business-managed resources.
- QR works for every business for check-in/analytics; advanced customization is gated.
- Amenities match premium search filters; rating feedback captures good/needs-attention amenities.
- Occupancy uses fixture counts including stalls, urinals, sinks, etc.
- Photos are size-aware; authorized Growth/Enterprise businesses can upload photos and VR/360 media.
- Multi-location selection must remain available, including All Locations overview.
- Bathroom verification must be GPS-gated, auditable, and usable as a gamification/data-collection signal.
