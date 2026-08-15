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
- Maps renders from the shared cache immediately while app-open GPS/discovery runs in the background.
- Only bathroom-verified records are exposed through `KleenestLocations`; unverified source records are retained as `KleenestMapCandidates`.
- Public Maps rendering and marker creation are explicitly bounded at 300 records so a large OSM/Overpass response cannot lock the browser UI.
- Candidate storage is bounded at 5,000 records and persisted separately from public restroom results.
- OSM/Overpass app-open discovery radius is bounded to 10 km for the interactive nearby refresh; the ingestion Edge Function can use a larger radius for catalog population.
- The manual Maps action is **Update my location** and is the only manual location refresh control. It gets a fresh GPS position and refreshes nearby data.

## Location catalog policy — 2026-08-15
Safe candidate categories include gas stations/travel stops, fast food/restaurants, cafes, hospitals/healthcare, parks/recreation, retail, libraries, airports, transit, lodging, public/government, worship, financial, culture and community locations.

Source records may be stored as candidates with provenance (`source`, `source_dataset`, `source_external_id`, `source_metadata`) and `bathroom_verification_status = 'unverified'`. They must not be presented as confirmed bathrooms until community/business verification promotes them to `has_bathroom`.

Supabase has an authenticated `ingest-map-candidates` Edge Function for OSM/Overpass candidate ingestion/upsert, plus source deduplication and lookup indexes.

## Gamification / social contract
The Maps ecosystem includes check-ins, location visits, favorites, reviews, bathroom verification, points, levels, badges and social activity. Bathroom verification is an auditable contribution signal and should award verification points once per user/location rather than allowing repeat farming.

## Latest Maps lockup fix — 2026-08-15
User reported: **the app stops responding after app open and then switching to Maps.** Investigation identified an unsafe path: interactive Maps discovery could return thousands of OSM/Overpass venues, then the Maps surface attempted to normalize, build HTML for, create Leaflet markers for, and persist a large dataset in one UI cycle. The prior external discovery allowed up to 5,000 OSM records and the preloader could merge that whole response into the public Maps array.

Implemented:
- Preloader cache moved to `v23`.
- Public verified Maps results capped at 300.
- Candidate cache capped at 5,000 and kept separate from public results.
- OSM/Overpass interactive radius reduced to 10 km; catalog ingestion remains independently capable of broader ingestion.
- Maps surface now renders at most 300 locations and no longer renders unverified candidates as restroom results.
- Removed the separate Refresh control from the actual Maps surface; `Update my location` is now the single manual action.
- Maps status copy now distinguishes verified locations from candidate data.

## Verification still required
1. Cold launch: confirm GPS starts without navigating to Maps.
2. App open with cached GPS: confirm fresh database + OSM/Overpass discovery occurs.
3. Switch Home → Maps and confirm the UI remains responsive while discovery is running.
4. Confirm Maps initially paints cached verified results immediately.
5. Confirm background discovery does not clear visible verified pins.
6. Confirm candidate counts can grow without causing public marker rendering to exceed the 300-location cap.
7. Confirm Update my location acquires fresh GPS and refreshes both sources.
8. Navigate Home → Maps → Home → Maps and confirm no duplicate GPS lifecycle.
9. Confirm map center/zoom and category/amenity filters persist.
10. Verify bathroom verification remains GPS-gated, auditable and connected to points/badges/social rewards.

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
