# Maps legacy bridge cleanup — 2026-08-17

Authoritative branch: `refactor/monolith-removal`

## Verified canonical path

The live `index.html` bootstrap loads the canonical tab-core registry and does not load the historical Maps bootstrap/preloader/compat/surface/polish/runtime layers. The active Maps Core is `cores/maps/maps-core.js`, which owns location, discovery, cache, filters, renderer, routing, routes, progression, engagement, verification, details, and navigation.

## Removed orphaned layers

- `kleenest-map-discovery-bootstrap.js`
- `kleenest-map-engine-bootstrap.js`
- `kleenest-map-preloader.js`
- `kleenest-maps-compat.js`
- `kleenest-maps-mount-guard-v1.js`
- `kleenest-maps-surface.js`
- `kleenest-map-runtime-fix-v1.js`
- `kleenest-maps-polish-v8.js`
- `kleenest-maps-polish-v65.js`

## Why

These files implemented historical global Maps APIs, duplicate GPS/discovery/cache lifecycles, legacy renderers, runtime monkey-patches, or polish layers that depended on superseded Maps surfaces. None is loaded by the authoritative bootstrap, and the canonical Maps Core provides the required lifecycle directly.

Notably, the old preloader created its own persistent GPS watcher and cache, while Maps Core already owns those responsibilities. The old runtime fix patched `KleenestCanonicalMapsV9` and depended on the deleted preloader. The old mount guard depended on `KleenestCanonicalMapsV8`. The old polish layers wrapped obsolete `KleenestMapsSurface` generations.

## Safety decision

No Supabase schema, RLS, RPC, or Edge Function changes were made in this pass.

## Verification

- Active bootstrap remains `KleenestModularShellV13` with `maps: canonical-tab-core-v4`.
- Canonical Maps Core remains the sole Maps tab lifecycle owner.
- Historical global Maps layers are removed rather than left executable.
- The source branch remains `refactor/monolith-removal`.
