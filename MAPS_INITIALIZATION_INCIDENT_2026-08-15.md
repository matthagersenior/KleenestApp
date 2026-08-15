# Maps initialization incident — 2026-08-15

## Symptom
The modular app remained usable, but opening Maps displayed: `Maps could not initialize, but the rest of Kleenest is still running.`

## Diagnosis
The authoritative modular Maps path loads `kleenest-maps-canonical-v7.js`, whose Leaflet loader depended on a single `unpkg.com` JavaScript request when `window.L` was not already present. The modular Maps shell catches any rejection from the canonical mount and replaces the Maps surface with the generic initialization message. GPS/discovery and the rest of Kleenest are therefore not the primary failure.

## Fix
Added `kleenest-map-engine-bootstrap.js`, which preloads Leaflet 1.9.4 with jsDelivr as the primary CDN and unpkg as a fallback, plus the Leaflet stylesheet. Updated `kleenest-modular-entry-v31.js` to load this engine bootstrap before the Maps preloader and modular shell.

## Architecture preserved
- GPS remains independent from Leaflet rendering.
- Supabase/OSM/Overpass discovery remains independent from the visual map engine.
- Cached/prepopulated locations remain available even when map rendering fails.
- Maps remains isolated so a visual map-engine failure does not stop the rest of Kleenest.

## Commits
- `3e74a03b520af7e4aaa92a24d2bd5195d915a93a` — Add resilient Leaflet map engine bootstrap
- `8a241bbec02fa6a554e36335e1395d795965d7b6` — Preload resilient Maps engine before modular shell

## Verification
The source-level failure path is addressed. Runtime verification still requires loading the deployed app and opening Maps on a device/network where the CDN requests can be observed. If both public CDNs are blocked, the Maps surface must be given a locally bundled map engine rather than another network dependency.
