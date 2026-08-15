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

## Standalone modular runtime
- `main` is the legacy monolith and is intentionally independent.
- `refactor/monolith-removal` is the modular application and is the branch Pages serves.
- Do not merge either branch into the other.
- Maps debugging and changes must target only the modular branch.

## Maps fast-navigation architecture — 2026-08-15
The primary Maps stall was traced to the modular shell waiting on unrelated application hydration before mounting Maps. The old shell path awaited `core()`, `hydrateIdentity()`, profile/membership reads, subscription RPCs, and the bathroom-verification module before it could mount the Maps surface.

Maps now has a dedicated fast path:
1. Render the modular header and Maps container immediately.
2. Load only the Maps surface module.
3. Mount Maps without waiting for account/profile/business/subscription hydration.
4. GPS/data preloading remains background work owned by `KleenestMapPreloader`.
5. Other surfaces retain the normal identity/business hydration path.
6. If Maps fails, show a contained Maps error instead of blocking the app shell.

Commit: `def3ebee1b1759d7a7928e1859d56517b19e6e23`.

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

## Lockup diagnosis history
- An earlier Maps control implementation used a document-wide `MutationObserver` that could retrigger itself through `textContent` changes. That was removed/neutralized.
- The modular shell's previous Maps route also waited on identity/business/subscription hydration. That dependency is now removed from the Maps route.

## Design rule
Do not move GPS/discovery back into the Maps renderer. The preloader is the single owner of warm location data and GPS lifecycle. Do not expose an unverified candidate as a confirmed bathroom destination.