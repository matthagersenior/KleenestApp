# Modular Recovery Note

## Mission / purpose
The large 5,000+ line `index.html` is the **monolith reference/demo/test/upgrade source**. It is NOT the modular production runtime. The purpose of this work is to migrate useful monolith features into maintainable modular files and expose those modules through one authoritative shell on `refactor/monolith-removal`.

When told to "look for the note", read this file first. Do not restart the investigation and do not replace the modular runtime with the monolith.

## Important repo finding
A major cause of the recent gaps was **not missing functionality**. Several features had already been built in earlier modular commits but the current shell/registry was no longer attaching them. The restored monolith/index history is a reference source; the goal is to reconnect the extracted modules, not copy the monolith renderer back.

## Latest checkpoint — Maps rendering/data integration
The user correctly reported that the map itself appeared but location population was still wrong. Inspection of the actual current modular files showed that `kleenest-maps-surface.js` had a hard-coded three-location fallback and only called Supabase discovery. The already-built external discovery module `kleenest-map-external-discovery.js` existed, but the Maps surface did not directly invoke it.

Historical map sources verified:
- `a343411d` — restored map discovery bootstrap.
- `bb17b7fb` — restored legacy Maps compatibility.
- `dbc62ca9` — real Supabase nearby discovery; `KleenestSupabase.nearbyLocations(lat,lng,miles)` calls the `nearby_locations` RPC with `p_lat`, `p_lng`, `p_radius_miles`.
- `b71c9497` — startup map/UI integration.
- `3ae57fe9` — corrected nearby RPC arguments and widened discovery.
- `f36ed5a1` — restored/fixed the historical Maps renderer markup.

### What was changed in the latest pass
- `kleenest-maps-surface.js` commit `1d760328` now directly invokes BOTH existing discovery layers:
  1. `KleenestSupabase.nearbyLocations()` for Kleenest locations.
  2. `KleenestMapExternalDiscovery.nearby()` for the existing OpenStreetMap/Overpass discovery.
- It automatically requests browser location on Maps mount, while still allowing the manual location button and refresh.
- It merges stored, Supabase, and external locations instead of falling back to only three hard-coded markers.
- It preserves `place_type`/`segment` so category filters work for bathrooms, gas stations, restaurants, cafes, retail, public, health, parks and transit.
- It normalizes latitude/longitude from all known data shapes.
- It renders markers and the location list from the SAME merged dataset.
- `kleenest-modular-feature-registry.js` was bumped to registry cache `r14` and continues registering `mapExternal`.
- The attempted index cache update hit a GitHub SHA conflict and was deliberately not forced; the current index still references registry `r13` / entry `modular11`, but the registry file itself now loads its modules with `r14`. This must be reconciled if the deployed page still serves a stale registry.

## Social/Games
- `kleenest-social-game-surface.js` remains the parent surface.
- Games, Contests and Rewards are child modes with a visible **Back** button.
- Historical `kleenest-engagement.js` is still the deeper durable service source and should be reconnected rather than replaced with local-only game behavior.

## Business/Admin/Profile
- Shell identity hydration uses Supabase session + profile + business memberships + subscription summary.
- Account level controls Business/Admin tab visibility.
- Business and Admin surfaces must use the existing modular workspace/data/state/analytics/QR/action/management modules.
- Do not infer business access from display text; use real membership/role/account-level data.

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

## Next work — continue as many tasks per pass as possible
1. Verify deployed Maps specifically: ensure the latest registry/entry is actually being served; if it is stale, fix the authoritative index cache URL using the current file SHA before doing more Maps logic changes.
2. Verify Maps data population: browser location -> Supabase nearby -> external OSM/Overpass -> merged dataset -> markers/list -> filters.
3. Verify selected location details, favorites and route entry against existing modular services.
4. Reconnect the richer historical Social/Game services and durable points/contest/reward data.
5. Verify Business/Admin rich surfaces mount after identity hydration and expose their real datasets/CRUD.
6. Reconnect QR Studio + advanced CRUD with Growth+/owner/admin gating.
7. Reconnect Photos/Media/VR, Partnerships, Campaigns, Promos/Offers, Events and Reviews/Replies.
8. Keep all datasets calculation-specific and location-specific; never show generic values for a selected dataset.
9. Continue comparing the monolith as a reference only and migrate missing capabilities into modular files rather than importing its renderer.
10. Keep startup lazy/non-blocking and avoid polling observers, recursive startup rendering, or duplicate auth systems.

## Non-negotiable product rules
- Branding: `Kleenest` only; never `KKleenest` or `Cleanest` in displayed app copy.
- Standard Business: basic overview stats.
- Growth+: advanced analytics, QR Studio, campaigns, promos/offers and advanced business tools.
- Account owner/admin controls customization and CRUD for business-managed resources.
- QR works for every business for check-in/analytics; advanced customization is gated.
- Amenities match premium search filters; rating feedback captures good/needs-attention amenities.
- Occupancy uses fixture counts including stalls, urinals, sinks, etc.
- Photos are size-aware; authorized Growth/Enterprise businesses can upload photos and VR/360 media.
- Multi-location selection must remain available, including All Locations overview.
- Do not restore the monolithic renderer as the modular runtime.
