# Modular Recovery Note

## Mission / purpose
The large 5,000+ line `index.html` is the **monolith reference/demo/test/upgrade source**. It is NOT the modular production runtime. The purpose of this work is to migrate useful monolith features into maintainable modular files and expose those modules through one authoritative shell on `refactor/monolith-removal`.

When told to "look for the note", read this file first. Do not restart the investigation and do not replace the modular runtime with the monolith.

## Important repo finding
A major cause of recent gaps was **not missing functionality**. Several features had already been built in earlier modular commits but the current shell/registry was no longer attaching them. The goal is to reconnect extracted modules, not copy the monolith renderer back.

## Latest Maps checkpoint
Maps is the highest-priority product surface because discovery is the primary reason users open Kleenest.

Authoritative path:
`index.html` -> `kleenest-modular-feature-registry.js` -> `kleenest-modular-entry.js` -> `kleenest-app-shell.js` -> `kleenest-maps-surface.js`.

### Actual blocker found in latest investigation
The visible `Maps surface failed to load` error was being produced by the shell before the Maps renderer could mount. The shell was treating optional location/external-discovery adapters as mandatory. A failure to load either adapter caused the shell to reject before calling `KleenestMapsSurface.mount()`.

A second important constraint: Maps itself must remain usable even if optional external discovery or the Leaflet CDN fails. The renderer already contains fallback behavior for data and map presentation; the shell must not prevent it from running.

### Latest fixes
- `kleenest-app-shell.js` commit `efe68c4c191ee693fbea8ecf632448f4f92eb23e`: Maps now treats **only `mapsSurface` as mandatory**. Location and external-discovery adapters are loaded after mounting and cannot block Maps startup.
- `kleenest-modular-entry.js` commit `e74848e13904ef5a0fa8e0f8346de02a705d5fa7`: shell cache version bumped to `shell16`.
- `index.html` commit `512f57e2556b6ffbfc53d77936ddc4e7662086f`: authoritative runtime bumped to registry `r19` / entry `modular16`.
- `kleenest-maps-surface.js` commit `1eb25c7302d6445f7c05275f3b81f327d4efde1c`: current self-contained Leaflet renderer, browser-location request, Supabase nearby merge, optional OSM/Overpass merge, filters, markers and location list.
- Existing `kleenest-map-external-discovery.js` remains the external venue source and is reused rather than rebuilt.

### Important verification rule
Do not claim Maps is fixed merely because files committed successfully. The deployed app must be checked for:
1. Maps surface actually mounting without the generic failure.
2. Home `Open Maps` and Maps tab both reaching the same surface.
3. External venues appearing beyond the three Kleenest fallback locations.
4. All category filters returning matching locations.
5. Marker/list synchronization when Leaflet is available.
6. Location details, favorites and route entry.

If Maps still reports **“Maps surface failed to load”**, inspect the actual deployed `index -> entry -> shell -> registry -> mapsSurface` script chain first. Do not change Supabase or rebuild discovery until that chain is verified.

If Maps mounts but external venues are missing, inspect the Overpass response/error path before changing the Supabase dataset again.

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
1. Verify Maps after deployment: external venues must appear, not just fallback Kleenest locations. Check All and every category, markers, list, details, favorites and route entry.
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