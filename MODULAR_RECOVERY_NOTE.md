# Modular Recovery Note

## Current Maps stability incident — 2026-08-15
Maps continued to make the app unresponsive after the initial data-volume fixes. The latest isolation found that the Maps control module still used a document-wide `MutationObserver`, which was unnecessary because the Maps surface already owns the button. That observer has now been removed completely. The control module only patches a supplied Maps root or responds to a targeted `kleenest:maps-controls-ready` event.

Maps surface v49 is additionally UI-first: only 30 verified locations are prepared for the interactive surface, Leaflet initialization is idle-deferred, marker creation is idle-deferred, and the public result list is rendered before the map engine work. This prevents a map render from monopolizing the WebView main thread.

Do not reintroduce a document-wide MutationObserver for Maps controls. Do not render hundreds/thousands of Leaflet markers synchronously. Keep candidate ingestion/cache separate from the public verified dataset.

## Maps architecture
- `kleenest-map-preloader.js`: sole GPS/discovery/cache owner.
- `kleenest-map-session.js`: persistent Maps state.
- `kleenest-maps-surface.js`: UI-first renderer; current stability version v49.
- `kleenest-map-controls.js`: targeted control patch only; no document observer.
- GPS begins at app open; `Update my location` forces fresh GPS + refresh.
- Public destination gate: bathroom verified only.
- Candidates remain separately cached and ingestible.

## Next diagnostic if Maps still stalls
If the app remains unresponsive after v49, temporarily disable **all Leaflet loading and all app-open discovery execution**, leaving only the static Maps UI and verified cached result list. This binary isolation will distinguish a Maps renderer problem from a global shell/preloader problem. Do not guess at additional marker or OSM fixes before performing that isolation.
