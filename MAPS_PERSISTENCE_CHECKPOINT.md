# Maps Persistence Checkpoint

Maps must behave as a persistent app service, not a page that rebuilds itself every time the user changes tabs.

## Required behavior
- GPS permission/location is acquired once and kept by one shared `KleenestMapPreloader` watcher.
- Current GPS is exposed as `KleenestMapBrowserLocation` and survives surface remounts.
- Location data is persisted in localStorage under `kleenest.maps.cache.v23`.
- Candidate locations are separately persisted under `kleenest.maps.candidates.v1` so unverified source data is not confused with public restroom destinations.
- Cached **bathroom-verified** locations hydrate immediately on startup.
- Fresh Supabase + OSM/Overpass data refreshes in the background when the app-open GPS cycle runs.
- Cache can remain usable for up to 7 days as stale data so Maps can open instantly while refreshing.
- `KleenestLocations` is the shared **public restroom dataset** consumed by Maps.
- `KleenestMapCandidates` contains source/discovery candidates that still require bathroom verification and are not presented as confirmed restroom destinations.
- Maps surface reads the shared cache instead of starting its own discovery/GPS pipeline.
- Navigation back to Maps must not request GPS again or wipe the location dataset.
- The single Maps manual action is **Update my location**; it acquires a fresh GPS position and refreshes nearby data. There is no separate Maps Refresh button.

## Verification gate
A location is a public Kleenest restroom destination only when `bathroom_verification_status = 'has_bathroom'` (or an equivalent explicit verified-bathroom flag from a trusted adapter). OSM/Overpass, government, public, chain and other source records may be stored as candidates with `bathroom_verification_status = 'unverified'`, but they must not be displayed as confirmed bathroom destinations until verified.

## Broad discovery categories
The discovery catalog intentionally includes gas stations/travel stops, restaurants/fast food, cafes, hospitals/healthcare, parks/recreation, retail, libraries, airports, transit, lodging, government/public places, worship, financial, culture and community locations. These are candidate sources; bathroom verification remains the display gate.

## Supabase catalog ingestion
- `locations` remains the canonical catalog table.
- Source provenance is stored with `source`, `source_dataset`, `source_external_id`, and `source_metadata`.
- A unique source-dataset/external-ID index prevents repeated OSM imports from creating duplicates.
- `ingest-map-candidates` is the Supabase Edge Function responsible for authenticated OSM/Overpass candidate ingestion/upsert.
- Public location reads are gated to active, verified, bathroom-confirmed records.

## Gamification/data collection
Bathroom verification is an auditable community signal. A user can contribute a verification vote, earn verification points once per user/location, and the location's aggregate bathroom status updates from that signal. Check-ins, visits, favorites, reviews, and other engagement remain part of the existing points/badges/social system.

## Latest lockup diagnosis — 2026-08-15
The Maps control module contained a `MutationObserver` watching the entire document and a callback that unconditionally changed the Maps button's `textContent`. Changing `textContent` itself produces a `childList` mutation, which retriggered the observer indefinitely. This created a main-thread microtask loop and explains the persistent app-wide unresponsiveness when the Maps controls were mounted.

Fixed in commit `d8e236da693b61e9a7c64495e68a03e9aa1c8eea`:
- DOM control patching is now guarded against re-entry.
- Text/ARIA changes only occur when the value actually differs.
- The observer is started safely after DOM readiness.
- The refresh button is still removed and `Update my location` remains the single manual action.

## Design rule
Do not move GPS/discovery back into the Maps renderer. The preloader is the single owner of warm location data and GPS lifecycle. Do not expose an unverified candidate as a confirmed bathroom destination.
