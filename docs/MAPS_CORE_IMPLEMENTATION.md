# Maps Core Implementation Contract

Authoritative application branch: `refactor/monolith-removal`.

## Core boundary

`cores/maps/maps-core.js` is the only Maps entry point exposed to the modular shell. It owns lifecycle, dependency validation, selection, filters, refresh, and teardown. It does not duplicate domain logic from its child modules.

## Required modules

1. location — GPS permission/state, first fix, persistent location session.
2. discovery — Supabase cache, OSM/Overpass/public sources, normalization and deduplication.
3. cache — hydration, freshness, stale-while-refresh, geographic locality.
4. session — map viewport/session state and app-open continuity.
5. catalog — canonical location types, amenities, source provenance and status.
6. verification — bathroom verification, evidence, GPS/geofence checks, moderation state.
7. engagement — check-ins, favorites, reviews, photos, verification actions.
8. details — complete location detail surface and action contracts.
9. filters — location type, amenities, verification, distance, availability and user preferences.
10. renderer — map provider, markers, clustering, viewport, loading and error states.
11. routes — navigation/directions and route completion metrics.
12. progression — XP, points, streaks, achievements, challenge/contest/game metrics.
13. social — sharing, discovery posts, community activity and social signals.
14. business — ownership, claimed locations, business edits, events, promotions and analytics-aware surfaces.

## Data flow

`GPS/app open -> location -> cache hydration -> discovery -> normalize/dedupe -> catalog -> renderer`

`location selection -> details -> engagement/verification/business/social/progression`

`user action -> canonical action/metric -> progression -> social/activity -> contests/challenges/games/events`

## Rules

- No legacy Maps implementation is a runtime dependency.
- No compatibility patch is a Maps module.
- No module reaches around another module to access its storage or UI state.
- Storage/schema changes must be explicit and versioned.
- RLS/ownership rules are part of the contract.
- Cached data may paint before network refresh, but stale data must be marked and reconciled.
- GPS startup must not block the rest of the application.
- Maps initialization failure must not prevent the rest of Kleenest from starting.
- Every user action that contributes to progression must emit one canonical metric event.
- Business-owned locations must use the same canonical location entity as public/community locations.

## Historical recovery scope

Historical monoliths, Maps branches, commits, backups and indexes are source material for feature recovery. They are not runtime dependencies. Before deleting any legacy Maps surface, its feature must be mapped to one of the modules above or explicitly marked retired.

## Implementation status

- Core boundary: implemented.
- Module contract: implemented.
- Visual shell: implemented.
- Domain modules: migration/recovery work remains.
- Schema audit: required before enabling production writes for recovered features.
- Shell integration: must point only to this core after module contracts are available.
