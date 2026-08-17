# Maps generation cleanup — 2026-08-17

**Authoritative branch:** `refactor/monolith-removal`

## Scope

Traced the active Maps dependency path against historical Maps renderer generations.

## Findings

- `cores/maps/maps-tab-core.js` is the canonical Maps tab boundary and exports `createMapsCore` from `cores/maps/maps-core.js`.
- `cores/maps/maps-core.js` is the active Maps lifecycle owner and directly constructs the subordinate location, discovery, filters, cache, session, renderer, routing, routes, progression, engagement, verification, details, navigation, and navigation UI modules.
- `index.html` does not load `kleenest-maps-canonical-v7.js`.
- The canonical Maps Core does not import or reference `kleenest-maps-canonical-v7.js`.
- The branch's application bootstrap identifies Maps as `canonical-tab-core-v4`.
- `kleenest-maps-canonical-v7.js` was therefore an orphaned legacy Maps renderer. Its internal banner identified it as canonical Maps v8 despite the filename, making it especially dangerous as a future accidental re-entry point.

## Fix

Removed `kleenest-maps-canonical-v7.js` from the authoritative branch.

## Verification

- Active Maps tab boundary preserved.
- Active Maps Core preserved.
- Maps subordinate lifecycle modules preserved.
- No Supabase schema, RLS, or RPC changes.
- No active bootstrap dependency on the removed renderer.

## Commit

`bbdfc4ee77a14aa0d6612c3d7a3079105be0bf13`

## Remaining risk

The GitHub code-search index remains incomplete for this repository. Remaining historical Maps files must continue to be classified from the actual branch/bootstrap/dependency graph rather than search absence alone.
