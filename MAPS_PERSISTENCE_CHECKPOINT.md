# Maps Persistence Checkpoint

Maps must behave as a persistent app service, not a page that rebuilds itself every time the user changes tabs.

## Required behavior
- GPS permission/location is acquired once and kept by one shared `KleenestMapPreloader` watcher.
- Current GPS is exposed as `KleenestMapBrowserLocation` and survives surface remounts.
- Location data is persisted in localStorage under `kleenest.maps.cache.v5`.
- Cached locations hydrate immediately on startup.
- Fresh Supabase + OSM/Overpass data refreshes in the background when the cache is older than 15 minutes.
- Cache can remain usable for up to 24 hours as stale data so Maps can open instantly while refreshing.
- `KleenestLocations` is the shared merged dataset consumed by Maps.
- Maps surface reads the shared cache instead of starting its own discovery/GPS pipeline.
- Navigation back to Maps must not request GPS again or wipe the location dataset.
- Manual Refresh is the explicit operation that forces a fresh location refresh.

## Latest commits
- `576c2672` — persistent cache + one GPS watcher
- `0170a915` — Maps surface 36 uses shared cache
- `296913de` — modular bootstrap cache-busted to shell27/preload5

## Design rule
Do not move GPS/discovery back into the Maps renderer. The preloader is the single owner of warm location data and GPS lifecycle.
