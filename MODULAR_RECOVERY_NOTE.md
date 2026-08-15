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
- Center the map on the user's actual GPS position.
- Show a distinct **You are here** marker and GPS accuracy circle.
- Query Kleenest/Supabase locations around the actual GPS point.
- Load the already-built external Overpass/OpenStreetMap discovery module and query it around the actual GPS point.
- Merge Kleenest + external pins, deduplicate them, and render the same merged dataset in the list and map.
- Keep All + every category filter working against that merged dataset.
- Never use the six demo locations as the only map result when external discovery is available.
- Selecting a marker or list item opens a rich location detail surface.
- Details include type, distance, rating, review count, amenities, directions, favorite, check-in, review and amenity feedback entry points.
- User location remains visible while browsing locations.

### Latest fix
`kleenest-maps-surface.js` commit `2ddb73b56a6f2ebaf6c80b9b0a5dd98325da1016` is **maps-surface-25**. It restores the full modular location experience on top of the working GPS/map/discovery pipeline. It adds marker-to-detail synchronization, distance, ratings/review counts, amenities, Directions, Favorite, Check In, Leave Review and amenity Feedback entry points while preserving GPS, external discovery and category filtering.

`kleenest-modular-entry.js` remains cache-busted to `shell21` in commit `9b4a0d578ec21da9c67acc70592ec8642c08ae46` so the current shell can reach the browser.

### Verification rule
Do not claim Maps is fixed merely because commits succeeded. Verify the deployed app for:
1. GPS permission prompt.
2. User marker and accuracy circle.
3. Map centered on the user.
4. External pins beyond the six demo businesses.
5. All/category filters populated from the merged dataset.
6. Marker/list synchronization.
7. Location details, distance, rating/review count and amenities.
8. Directions, Favorite, Check In, Leave Review and amenity Feedback entry points.
9. Existing shared controllers actually open the corresponding flows when present.

If external pins still do not appear after maps-surface-25, inspect the actual Overpass response/error path and the deployed external-discovery script load. Do not rebuild the map renderer or change Supabase blindly.

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
1. Verify Maps after deployment: GPS, user marker, external pins, All/category filters, markers, list, details, favorites, route entry and feedback/check-in/review controller integration.
2. If external venues still do not appear, inspect the Overpass response/error path before changing Supabase again.
3. Reconnect durable Social/Game points, contests and rewards.
4. Verify Business/Admin rich mounts and datasets after identity hydration.
5. Reconnect QR Studio + advanced CRUD with Growth+/owner/admin gating.
6. Reconnect Photos/Media/VR, Partnerships, Campaigns, Promos/Offers, Events, Reviews/Replies and amenities.
7. Keep datasets location-specific and calculation-specific.
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
