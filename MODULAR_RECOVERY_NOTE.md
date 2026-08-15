# Modular Recovery Note

## Mission / purpose
The large 5,000+ line `index.html` is the **monolith reference/demo/test/upgrade source**. It is NOT the modular production runtime. The purpose of this work is to migrate useful monolith features into maintainable modular files and expose those modules through one authoritative shell on `refactor/monolith-removal`.

When told to "look for the note", read this file first. Do not restart the investigation and do not replace the modular runtime with the monolith.

## Important repo finding
A major cause of recent gaps was **not missing functionality**. Several features had already been built in earlier modular commits but the current shell/registry was no longer attaching them. The goal is to reconnect extracted modules, not copy the monolith renderer back.

## Latest Maps checkpoint
Maps is the highest-priority product surface because discovery is the primary reason users open Kleenest.

### Persistent Maps architecture — latest
The Maps data lifecycle is now **local-first and navigation-safe**.

- `kleenest-map-preloader.js` uses `localStorage` key `kleenest.maps.cache.v6`.
- Cached locations are hydrated immediately when the app/bootstrap starts.
- Cached GPS position is hydrated immediately too.
- A single `navigator.geolocation.watchPosition()` watcher is kept alive globally; Maps mounts do not request a new GPS fix just because the user changed tabs.
- Cached data is shown immediately and refreshed in the background on a 15-minute freshness window.
- Cached data remains usable for up to 7 days before being discarded as stale.
- Supabase/Kleenest locations and OSM/Overpass locations are merged and deduplicated by name + coordinate.
- The Maps surface consumes the global cache rather than rebuilding the dataset from scratch on every mount.
- Maps filter state (`category` and `amenity`) is preserved in `window.KleenestMapsView` when navigating away and back.
- `kleenest-modular-entry.js` is cache-busted to preload6/shell28.

### Expected behavior
1. Open the app.
2. GPS watcher starts once.
3. Local Maps cache hydrates immediately if available.
4. Supabase + OSM/Overpass refresh happens in the background.
5. Open Maps: existing pins appear immediately.
6. Navigate Home/Social/Profile/etc.
7. Return to Maps: **no new GPS request and no empty/loading cycle**; cached pins appear immediately.
8. Background refresh can add newer locations without clearing existing pins.
9. Manual Refresh deliberately forces a new data refresh.

### Latest commits
- Maps surface: `489c909e6f8072f65cf151f29042688c675e201d` — maps-surface-37.
- Persistent preloader: `e16ac55f2029cc997dfb981e16a6fa22c4469f5f` — local-first cache v6.
- Bootstrap: `32983cd8e2cdabb0b83e47043a85869e81ae4692` — preload6/shell28.

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
1. Verify deployed Maps: no repeated GPS request on tab return; cached pins immediately visible.
2. Verify background OSM/Overpass + Supabase refresh merges without clearing existing results.
3. Apply the polished Maps button/chip design system to shared modular buttons and navigation.
4. Reconnect durable Social/Game points, contests and rewards.
5. Verify Business/Admin rich mounts and datasets after identity hydration.
6. Reconnect QR Studio + advanced CRUD with Growth+/owner/admin gating.
7. Reconnect Photos/Media/VR, Partnerships, Campaigns, Promos/Offers, Events, Reviews/Replies and amenities.

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
