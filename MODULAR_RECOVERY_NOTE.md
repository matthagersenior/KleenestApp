# Modular Recovery Note

## Mission / purpose
The large 5,000+ line `index.html` is the **monolith reference/demo/test/upgrade source**. It is NOT the modular production runtime. The purpose of this work is to migrate useful monolith features into maintainable modular files and expose those modules through one authoritative shell on `refactor/monolith-removal`.

When told to "look for the note", read this file first. Do not restart the investigation and do not replace the modular runtime with the monolith.

## Important repo finding
A major cause of recent gaps was **not missing functionality**. Several features had already been built in earlier modular commits but the current shell/registry was no longer attaching them. The goal is to reconnect extracted modules, not copy the monolith renderer back.

## Latest Maps checkpoint
Maps is the highest-priority product surface because discovery is the primary reason users open Kleenest.

### Current required behavior
- Ask for browser GPS automatically when Maps opens.
- Warm GPS/location discovery at app startup instead of waiting for the Maps tab.
- Center the map on the user's actual GPS position.
- Show a distinct **You are here** marker and GPS accuracy circle.
- Query Kleenest/Supabase locations around the actual GPS point.
- Load the already-built external Overpass/OpenStreetMap discovery module and query it around the actual GPS point.
- Merge Kleenest + external pins, deduplicate them, and render the same merged dataset in the list and map.
- Cache the merged location dataset globally so navigation away from Maps does not discard it.
- Cache the Overpass/external discovery response and Supabase nearby response so reopening Maps does not immediately repeat the network discovery work.
- Keep All + every category filter working against that merged dataset.
- Never use the six demo locations as the only map result when external discovery is available.
- Selecting a marker or list item opens a rich location detail surface.
- Details include type, distance, rating, review count, amenities, directions, favorite, check-in, review and amenity feedback entry points.
- User location remains visible while browsing locations.

### Latest persistent Maps work
`kleenest-map-preloader.js` commit `75f4b05d239c33093309a624ea23bae35af187bf` introduces `KleenestMapCache`. It warms GPS, existing Kleenest/Supabase locations and the existing Overpass/OpenStreetMap discovery module when the app starts. It merges/deduplicates the results, exposes them as `KleenestLocations`, and wraps the already-loaded discovery functions with cached responses for the current warm dataset.

`kleenest-app-shell.js` commit `ee642040b16d6ea684e5ab958e8dbf8048232e7f` starts the map preloader immediately after the modular shell boots. Maps therefore has a warm dataset before the user selects Maps.

The Maps UI uses the polished pill/chip/card visual language introduced in the recent Maps surface. That button treatment should be treated as the visual standard for the rest of the app: rounded controls, subtle gradients, clear active states, depth/hover feedback, and icon-supported actions.

### Verification rule
Do not claim Maps is fixed merely because commits succeeded. Verify the deployed app for:
1. Startup begins location/discovery warming.
2. GPS permission prompt appears appropriately.
3. User marker and accuracy circle appear.
4. Map opens with the previously warmed pins instead of an empty/demo-only state.
5. External pins beyond the six demo businesses are present.
6. All/category filters populated from the merged dataset.
7. Amenity filters work against the same dataset.
8. Marker/list synchronization.
9. Location details, distance, rating/review count and amenities.
10. Directions, Favorite, Check In, Leave Review and amenity Feedback entry points.
11. Navigating Home/Social/Profile and returning to Maps does not require repeating the discovery network process.
12. Existing shared controllers actually open the corresponding flows when present.

If external pins still do not appear after the persistent preloader, inspect the Overpass response/error path and the deployed external-discovery script load. Do not rebuild the map renderer or change Supabase blindly.

## Social/Games
- `kleenest-social-game-surface.js` is the parent surface.
- Games, Contests and Rewards have a visible **Back** button.
- Historical `kleenest-engagement.js` is the durable service source and should be reconnected rather than replaced with local-only game state.

## Business/Admin/Profile
- Shell identity hydration uses Supabase session + profile + business memberships + subscription summary.
- Account level and real membership/role determine Business/Admin visibility.
- Business/Admin must mount existing modular workspace/data/state/analytics/QR/action/management modules.

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
1. Verify persistent Maps startup cache in the deployed app.
2. Reconnect durable Social/Game points, contests and rewards.
3. Verify Business/Admin rich mounts and datasets after identity hydration.
4. Reconnect QR Studio + advanced CRUD with Growth+/owner/admin gating.
5. Reconnect Photos/Media/VR, Partnerships, Campaigns, Promos/Offers, Events, Reviews/Replies and amenities.
6. Keep datasets location-specific and calculation-specific.
7. Apply the polished Maps button/control language consistently throughout the app.
8. Never restore the monolithic renderer as the modular runtime.

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