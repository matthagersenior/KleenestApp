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

## 2026-08-16 — P0/P1/P2 implementation program started

### P0 — productization foundation

- Added `kleenest-design-system-v1.css` as the canonical shared visual token/state layer: brand colors, surfaces, spacing, radii, shadows, trust badges, skeletons, empty states, actions, and focus behavior.
- Wired the design system into the modular entrypoint.
- Added mobile-first consumer navigation with Home, Maps, Social, Profile and contextually authorized Business/Admin destinations.
- Added safe-area handling and responsive five-item navigation when a privileged destination is present.
- Improved Maps location trust presentation: explicit Verified / Community confirmed / Listed · verify states, accessible result labels, real loading skeletons, and useful empty/error copy.
- Added an app description meta tag and mobile viewport-fit handling.

### P0 implementation pass — consumer utility + trust

- Added `kleenest-home-priority-bridge-v1.js` and wired it into the entrypoint so the first post-hero action is explicitly the real live Maps discovery flow.
- Added `cores/maps/maps-trust.js`, deriving a deterministic 0–100 trust confidence from existing authoritative location fields only: verification status, provenance/source, verification counts, community positive/negative evidence, rating/review count, and freshness.
- Wired trust confidence into real map markers/popups/list rows; no synthetic location evidence is created.
- Standardized trust presentation as `Highly trusted`, `Trusted`, `Community signal`, or `Needs verification` with the numeric confidence exposed to users.
- Replaced remaining account destructive browser confirmation in the control bridge with an in-app confirmation dialog.
- Corrected the Business feature-gap bridge so advanced datasets require Growth/Enterprise **and** Owner/Admin/Manager; Analyst is no longer treated as a CRUD-capable advanced role.

### 2026-08-16 — P0 shell hardening

- Inspected the modular shell's privileged navigation and all consumer/business/admin initialization error surfaces.
- Removed stale `KleenestBusinessState` length/current-business heuristics from Business navigation authorization; privileged navigation is now derived from the authenticated user's actual business/admin role signals.
- Added route-level authorization guards so manually navigating to Business/Admin while unauthorized redirects to Home rather than mounting a privileged surface.
- Replaced raw backend/internal error messages shown to consumers with safe, user-facing fallback messages while retaining detailed errors in the console for diagnostics.
- Added retry controls to Business/Admin initialization failures.
- Preserved real lazy loading for Social/Maps and the existing server-side permission enforcement; no client-only authorization is treated as a security boundary.

### Verification

- Reviewed the modular entrypoint and shell dependency graph before changes.
- Confirmed Maps renderer consumes real location records and existing verification/provenance fields; no synthetic trust score/evidence was introduced.
- Confirmed Business/Admin mobile destinations are derived from the existing role signals used by the modular shell.
- Confirmed current map ingestion already uses JWT-protected `ingest-map-candidates` and writes source provenance (`source_dataset`, `source_external_id`, `source_metadata`).
- Reviewed the Maps core contract and verified all required modules are still initialized through the modular shell.

### Remaining P0 work

- Finish public-data ingestion/prepopulation and provenance controls, including abuse/rate controls around client-triggered ingestion.
- Complete business CRUD/action end-to-end validation for every advanced feature.
- Finish unified loading/error/empty behavior across every core.
- Remove remaining monolith-style startup/global dependencies through lazy module ownership.
- Complete device/browser regression coverage before declaring P0 complete.

## Current active audit track

**P0/P1/P2 implementation:**

`product hierarchy → trust/data provenance → consumer utility → business value → entitlement → CRUD/actions → analytics → cross-feature effects → mobile/accessibility → regression`

Continue executing this track in large batches. Do not stop at recommendation-only findings.
