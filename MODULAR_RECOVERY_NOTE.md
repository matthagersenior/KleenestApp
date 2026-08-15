# Modular Recovery Note

## Mission / purpose
The large 5,000+ line `index.html` is the **monolith reference/demo/test/upgrade source**. It is NOT the modular production runtime. The purpose of this work is to migrate useful monolith features into maintainable modular files and expose those modules through one authoritative shell on `refactor/monolith-removal`.

When told to "look for the note", read this file first. Do not restart the investigation and do not replace the modular runtime with the monolith.

## Important repo finding
A major cause of the recent gaps was **not missing functionality**. Several features had already been built in earlier modular commits but the current shell/registry was no longer attaching them. The restored monolith/index history is a reference source; the goal is to reconnect the extracted modules, not copy the monolith renderer back.

Relevant historical map commits discovered during reconciliation:
- `a343411d` — restored `kleenest-map-discovery-bootstrap.js`.
- `bb17b7fb` — restored legacy Maps compatibility.
- `dbc62ca9` — wired real Supabase signup + nearby map discovery.
- `b71c9497` — restored UI integration with startup map/signup fixes.
- `3ae57fe9` — corrected `nearby_locations` RPC argument names and widened discovery.
- `f36ed5a1` — corrected Maps renderer markup and restored a Maps renderer/partner-access layer.
- `37a0b8a1` — QR surface and advanced business controls were already built in modular form.

The current modular branch already contains the repaired Supabase nearby-location signature and the extracted Maps compatibility layer. The problem was that Maps did not request location on mount and did not reconnect the richer external discovery behavior.

## Latest checkpoint — Maps is now the priority
Completed in the latest pass:
- Added `kleenest-map-external-discovery.js`, a modular extraction of the existing Overpass/OpenStreetMap discovery behavior from the monolith. It discovers public restrooms plus restaurants, cafes, gas/travel, retail, health, parks, transit and public facilities.
- Added `mapExternal` to the authoritative feature registry.
- Updated the modular shell Maps path to load `mapExternal`.
- Maps now automatically requests the user's location when the Maps surface opens, rather than waiting for the user to press the location button.
- Maps then calls the existing Supabase/Kleenest discovery and the external OSM discovery, merging the results through the Maps surface.
- External map results preserve `place_type`/`segment` so the existing category filters can actually select restaurants, gas stations, cafes, etc.
- Registry cache is now `r13`; modular entry is `modular11`.
- Current Maps-related commits from this recovery pass: `29857161` (external discovery), `3b7b82fd` (registry), `31559256` (shell), `e2b3272b` (index/cache).

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
1. Verify Maps in the deployed modular runtime: confirm automatic GPS, Supabase locations, OSM external locations, category filters, map markers, selected location details, favorites and route entry.
2. If Maps still shows only fallback locations, inspect browser/network errors and the exact loaded registry version before changing the data model again.
3. Reconnect the richer historical Social/Game services and durable points/contest/reward data.
4. Verify Business/Admin rich surfaces mount after identity hydration and expose their real datasets/CRUD.
5. Reconnect QR Studio + advanced CRUD with Growth+/owner/admin gating.
6. Reconnect Photos/Media/VR, Partnerships, Campaigns, Promos/Offers, Events and Reviews/Replies.
7. Keep all datasets calculation-specific and location-specific; never show generic values for a selected dataset.
8. Continue comparing the monolith as a reference only and migrate missing capabilities into modular files rather than importing its renderer.
9. Keep startup lazy/non-blocking and avoid polling observers, recursive startup rendering, or duplicate auth systems.

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
