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

## Recurring pass format

For every audit pass record:
1. Date/time
2. Branch/commit
3. Areas inspected
4. Findings
5. Fixes applied
6. Verification performed
7. Remaining risks/gaps

## 2026-08-16 — Initial master audit

- Established the full-app audit baseline.
- Identified that the Admin surface exposed only a subset of the production data model.
- Established the production Supabase schema/RPC inventory as an authoritative cross-reference source.
- Identified duplicate Admin/Profile implementations in the modular entrypoint.

## 2026-08-16 — Modular architecture cleanup

- Closed PR #4 attempting to sync `main` into `refactor/monolith-removal`.
- Made `refactor/monolith-removal` the authoritative working branch.
- Removed duplicate Admin v1/account-admin v1 loaders from the modular entrypoint.
- Removed duplicate Profile v1 loader; Profile v2 remains canonical.

## 2026-08-16 — Maps infrastructure

- Fixed empty discovery path with GPS → authoritative nearby lookup → live OSM/Overpass ingestion → retry.
- Added durable Maps browser cache with TTL/versioning and graceful storage failure handling.
- Added Maps audit checkpoint.

## 2026-08-16 — Maps → Progression cross-reference

- Added missing progression metrics for location visits, favorites/unfavorites, and verification.
- Corrected Maps engagement source types so visits/favorites/check-ins are not mislabeled.

## 2026-08-16 — Admin CRUD UX

- Replaced browser `prompt/alert/confirm` CRUD flow with an in-app Admin editor.
- Preserved protected `admin_crud_gateway` authorization.
- Added real save/error/refresh/destructive-confirmation states.

## 2026-08-16 — Admin operational datasets

- Expanded Admin visibility for event RSVPs, family groups/members, route events/plans/stops and other operational datasets.
- Classified sensitive/derived/transactional datasets as read-only where arbitrary CRUD would be unsafe.
- Expanded the production Admin gateway allowlist accordingly.

## 2026-08-16 — Orphan dataset audit

- Began tracing datasets without identifiable repository consumers.
- Confirmed `club_memberships`, `point_transactions`, `user_badges`, `progression_actions`, and `preferred_location_activations` require authority/consumer review before UI creation.
- No speculative UI was added for these datasets.

## 2026-08-16 — Reward integrity and authorization hardening

- Consolidated duplicate check-in, review, and bathroom-verification point awards under the canonical gamification authority.
- Gated review/social-post rewards on publication state.
- Prevented cross-user gamification attribution.
- Locked down zero-policy sensitive tables with owner/admin-scoped RLS.
- Restricted demo identity registry to admins.
- Removed hardcoded administrator-email authorization from amenity mutations.
- Removed client execution of internal reward/analytics/maintenance SECURITY DEFINER RPCs.
- Restricted anonymous access to user reward history and legacy business metric/review RPCs.

## 2026-08-16 — Business feature permission matrix

- Normalized advanced-tier authorization across campaigns, events, contests, promotions, and QR CRUD.
- Standard-tier businesses remain limited to basic capabilities.
- Hardened contest entries and promotion redemptions against inactive/expired records.
- Hardened event RSVP creation against invalid event status.
- Removed duplicate favorites RLS policy.

## 2026-08-16 — Progression feature-gap closure

- Hardened progression metric event writes against client-supplied system events.
- Added the real progression challenge completion authority:
  - validates authentication, enabled challenge, membership, and target
  - marks completion once
  - awards the configured challenge reward through the canonical gamification/point path
  - remains idempotent on repeated completion attempts
- Added `cores/progression/progression-challenges-core.js` with real Supabase-backed challenge loading/join/completion behavior.
- Added `kleenest-progression-challenges-bridge.js` and loaded it from the modular bootstrap so the Social → Compete surface now consumes the production challenge dataset rather than merely listing it.
- Added app-wide styling for the challenge cards using the existing Kleenest visual language.
- Enforced one challenge entry per user/challenge and blocked client mutation of `completed_at`.
- Added an Admin Community → Progression bridge exposing actions, games, challenges, challenge entries, badges, and streaks through the existing protected Data & CRUD surface.

## Current active audit track

**Progression/Rewards authority chain:**

`user action → progression metric → progression event → point transaction → badge/streak/challenge → leaderboard/reward → profile/social/admin`

Next passes must continue app-wide rather than stopping at this subsystem.
