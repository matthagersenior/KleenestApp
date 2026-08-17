# P0 Maps Mount/Data Guard — 2026-08-17

## Finding
The canonical Maps renderer reads `KleenestMapPreloader.cache.locations` during mount, while the app shell was loading the preloader only after mounting Maps. The preloader's discovery is asynchronous, so a cold cache could produce a correctly mounted Leaflet map with zero locations and no automatic refresh.

## Fix
Added `kleenest-maps-mount-guard-v1.js` before the canonical Maps module/router in `index.html`.

The guard:
- warms the persistent Maps data service before canonical mount;
- preserves immediate canonical map mounting even if discovery is slow;
- listens for `kleenest:map-data-updated`;
- performs one controlled canonical remount when verified location data arrives;
- isolates preload failures so Leaflet/map UI can still initialize.

## Scope
Working branch only: `refactor/monolith-removal`.
`main` is reference-only and was not modified.

## Regression target
Fresh load → Maps → GPS permission/fix → location discovery → logout/login → Maps again → location data remains available and the single canonical navigation shell remains active.
