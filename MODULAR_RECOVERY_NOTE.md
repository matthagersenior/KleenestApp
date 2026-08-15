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

### Actual blockers found
1. A stale/failed `mapsSurface` script tag could be mistaken for a registered module. This produced **“Maps renderer did not register”** even though the browser had not executed the current surface.
2. After registration was finally visible, the UI showed the map container but **no map tiles**. The current renderer called `global.L.map(...)` but did not load Leaflet itself, and repository search found no Leaflet implementation/dependency. Thus `global.L` was undefined and `drawMap()` silently returned.

### Latest fix
`kleenest-maps-surface.js` commit `d983f632e6c68d1754819cb4cf9d345ee3521738` is now **maps-surface-22**. It is self-contained for the map engine:
- dynamically loads Leaflet 1.9.4 JavaScript
- dynamically loads Leaflet CSS
- waits for Leaflet before drawing
- creates the actual OSM tile map
- renders markers and fits bounds to the current dataset
- keeps the location list and category filters
- still merges Supabase/Kleenest locations and existing external discovery
- keeps GPS optional and uses the existing Sparta fallback when needed

Do not mistake the six demo locations for the complete discovery result. The next check is the external discovery adapter and its response path.

### Important verification rule
Do not claim Maps is fixed merely because files committed successfully. The deployed app must be checked for:
1. Maps surface actually mounting without the generic failure.
2. Home `Open Maps` and Maps tab both reaching the same surface.
3. Actual OSM tiles visible in the map container.
4. External venues appearing beyond the six Kleenest/demo locations.
5. All category filters returning matching locations.
6. Marker/list synchronization.
7. Location details, favorites and route entry.

If the map container is still blank after `maps-surface-22`, inspect whether the Leaflet CDN script/CSS is blocked by the deployed environment before changing discovery logic.

If the map renders but only six demo locations appear, inspect the external discovery adapter's availability/response and its script load order before changing Supabase again.

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
1. Verify Maps after deployment: tiles first, then external venues, then All/category filters, markers, list, details, favorites and route entry.
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
