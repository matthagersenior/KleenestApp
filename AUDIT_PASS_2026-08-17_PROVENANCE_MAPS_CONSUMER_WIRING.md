# Audit Pass — Maps Provenance Consumer Wiring — 2026-08-17

**Authoritative branch:** `refactor/monolith-removal`

## Scope

Trace the authoritative location-confidence RPC through the actual active Maps consumer to rendered UI interpretation, without relying on GitHub code-search indexing.

## Repository trace

- Repository: `matthagersenior/KleenestApp`
- Branch: `refactor/monolith-removal`
- Branch head after fix: `81b3e648cb67aa2e476b06e316f5225106b89e57`
- Active Maps Core: `cores/maps/maps-core.js`
- Active discovery import: `cores/maps/maps-discovery-v3.js`
- Active renderer import: `cores/maps/maps-renderer-v2.js`
- Active renderer trust display is in `maps-renderer-v2.js`; the previously available `maps-trust.js` calculation is not used for the server-authoritative confidence badge.

## Live Supabase contract

Verified in production:

- `public.kleenest_location_confidence(uuid)` exists.
- Return shape: `score numeric`, `level text`, `verification_count integer`, `source_count integer`, `review_count integer`, `factors jsonb`.
- Function is `STABLE` and not `SECURITY DEFINER`.
- Current definition derives freshness from the latest source, external observation, or bathroom-verification evidence timestamp.
- Current definition exposes `evidence_fresh_at`, `freshness_basis`, contradiction count, contradiction window, and contradiction policy in `factors`.
- `nearby_locations_enriched(...)` is the active location-discovery RPC and returns canonical amenities/fixtures alongside location rows.

## Consumer wiring verified

The active Maps Core mounts `maps-renderer-v2.js` and calls its `refresh()` with `state.locations` after discovery. The renderer now:

1. Accepts the canonical Supabase client through the existing global client fallback.
2. Hydrates `kleenest_location_confidence` for UUID-backed location rows.
3. Caches confidence per location for the renderer lifetime.
4. Uses the server-returned `score` and `level` directly for the visible confidence badge.
5. Surfaces `contradictory_amenity_count > 0` as `Evidence conflict` rather than altering the score locally.
6. Includes confidence values in marker/list render signatures so hydrated confidence causes the rendered list to update.
7. Leaves the existing client-side `maps-trust.js` scoring formula out of the authoritative interpretation path.

## Production verification

A live SQL invocation of `kleenest_location_confidence` was executed for all six current `locations` rows. The RPC returned populated scores/levels and the expected provenance factors, including evidence freshness and contradiction metadata.

The six current rows remain the known demo/test dataset. This pass does not replace or manufacture location data and does not alter confidence weights.

## Fix

Changed only `cores/maps/maps-renderer-v2.js` to wire the existing server-authoritative confidence RPC into the active Maps renderer. No schema, RLS, RPC definition, scoring formula, ingestion authority, or fallback dataset was changed.

## Verification status

- GitHub branch head verified at `81b3e648cb67aa2e476b06e316f5225106b89e57`.
- Commit diff verified for the renderer file.
- Live Supabase function definition verified.
- Live Supabase RPC execution verified.
- GitHub commit status endpoint currently reports no status checks for this commit; CI completion is therefore not claimed.

## Remaining risk / next gate

Browser-level verification remains required to confirm the deployed GitHub Pages bundle is serving this branch head and that the confidence badge appears in the rendered Maps list for live UUID-backed locations. No further confidence-semantic change should be made until that browser path is observed.
