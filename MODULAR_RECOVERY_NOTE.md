# Modular Recovery Note

## Mission / purpose
The large 5,000+ line `index.html` is the **monolith reference/demo/test/upgrade source**. It is NOT the modular production runtime. The purpose of this work is to migrate useful monolith features into maintainable modular files and expose those modules through one authoritative shell on `refactor/monolith-removal`.

When told to "look for the note", read this file first. Do not restart the investigation and do not replace the modular runtime with the monolith.

## Current Maps architecture
Maps is the highest-priority product surface. It must feel persistent and instant rather than restarting GPS/data discovery every time the user changes tabs.

### Persistent Maps behavior
- `kleenest-map-preloader.js` is the single Maps data/GPS service.
- It starts once and guards itself with `__KLEENEST_MAP_PRELOADER__`.
- It uses one `navigator.geolocation.watchPosition()` watcher rather than starting a new GPS request on every Maps mount.
- It hydrates the merged location dataset and last known user position from `localStorage` first.
- Cache key is `kleenest.maps.cache.v10`.
- Cached location data can remain usable for up to 7 days; it is considered fresh for 15 minutes.
- Fresh cached data is displayed immediately; stale data is refreshed in the background.
- Supabase/Kleenest locations, OSM/Overpass discovery, and local location data are merged and deduplicated rather than replacing the existing cache.
- The Maps surface should consume `window.KleenestLocations` / `window.KleenestMapCache`, not start its own independent GPS/data pipeline.
- Navigation back to Maps must not request GPS again when the shared watcher/user position already exists.

### Bootstrap
`kleenest-modular-entry.js` now warms `kleenest-map-preloader.js?preload=10` before loading the authoritative app shell (`shell30`).

### Design standard
The polished Maps chips/buttons are now the visual reference for the rest of the app: rounded controls, clear primary/secondary hierarchy, subtle depth, active state, icons, responsive horizontal scrolling where appropriate, and consistent interaction feedback. Do not revert to plain default browser buttons.

## Maps product behavior
- GPS user marker + accuracy circle.
- Supabase/Kleenest locations + OSM/Overpass locations.
- All/category filters + premium amenity filters.
- Rich location cards/details.
- Directions, favorites, check-in, review and amenity feedback entry points.
- Check-in must be geofenced; review requires a verified check-in for that location.
- External locations are discovery data; business-owned data remains authoritative for business-managed fields.

## Existing modular feature sources to reconnect
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
- `f61b40bc` — shared geofence checks
- `ed04d867` — shared check-in location routing
- `7a0d685` — authenticated check-in/review runtime actions

## Next work
1. Verify deployed Maps does not remount/restart GPS/data discovery on tab navigation.
2. Verify local-first cache is visible immediately after a full refresh, then background refreshes.
3. Reconnect durable Social/Game/Rewards services.
4. Reconnect Business/Admin datasets and polished controls.
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
