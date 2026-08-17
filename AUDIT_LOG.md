# Kleenest Full-App Audit Log

**Authoritative branch:** `refactor/monolith-removal`

## Operating rules

- Audit the entire application, not just Admin.
- Cross-reference UI → handler → module/core → RPC/API → authorization → dataset → side effects → analytics/UI refresh.
- Fix verified defects immediately when safe.
- Do not add placeholders or fake wiring.
- Do not merge `main` into the modular branch during this audit.
- Classify datasets as CRUD, controlled-action, read-only, derived/internal, or orphan/needs-authority-review.
- Preserve protected permission/entitlement boundaries.
- Reuse the strongest existing Kleenest design language app-wide.
- Execute P0/P1/P2 work as implementation tasks, not as a recommendation-only backlog.

## Recurring pass format

For every audit pass record: date/time, branch/commit, areas inspected, findings, fixes applied, verification performed, remaining risks/gaps.

## 2026-08-17 — Maps supporting-module consolidation

- Audited `cores/maps` after establishing the single Maps tab-core boundary.
- Found two competing Discovery implementations: `maps-discovery.js` and `maps-discovery-v2.js`.
- Kept `maps-discovery.js` as the canonical Discovery service because it contains the authoritative enriched nearby RPC, public-data ingestion retry, database fallback, OSM/Overpass enrichment, deduplication, and filter pipeline.
- Rewired `kleenest-maps-safe-runtime-v1.js` to dynamically load the canonical `maps-discovery.js` for GPS-based nearby loading, radius refreshes, and amenity filters.
- Removed duplicate `cores/maps/maps-discovery-v2.js`.
- Found `maps-location-stable-v1.js` to be a thin compatibility wrapper around `maps-location.js` whose `subscribe()` intentionally did nothing. Removed it rather than preserving a misleading second location contract.
- Advanced the Maps runtime cache key from `maps-core=15` to `maps-core=16`.
- No database schema, RLS, RPC, or authorization policy was changed.

## Verification status

- Maps has one canonical tab core and one canonical discovery implementation.
- Maps runtime now consumes the canonical Discovery service for GPS-based nearby data instead of maintaining a second direct-query discovery path.
- Duplicate Maps Discovery v2 and Stable Location v1 implementations are removed.
- Browser/device runtime verification remains required for GPS initialization, discovery counts, refresh behavior, OSM ingestion, and Maps mount/unmount.
- Remaining Maps supporting modules must be dependency-traced before deletion; they are not automatically duplicates merely because they are separate files.