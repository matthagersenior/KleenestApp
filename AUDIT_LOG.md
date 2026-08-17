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

## 2026-08-16 — P0/P1/P2 hardening pass

- Established P0/P1/P2 as implementation gates rather than a recommendation backlog.
- Added canonical design-system tokens for brand, surfaces, typography, spacing, focus states, trust states, skeletons, empty states, and primary/secondary actions.
- Wired the modular shell to the canonical design-system token names instead of maintaining a separate color/radius vocabulary.
- Corrected modular shell async rendering so route-specific cores are awaited before final binding.

## 2026-08-16 — Large-scale platform wiring pass

- Added `cores/platform/platform-quality-gates.js` as a shared runtime guard layer for modular cores. It centralizes required Supabase/user/root checks, safe identifiers, role checks, normalized action results, and async action error boundaries.
- Added `cores/platform/platform-data-provenance.js` as the canonical provenance/freshness contract for OSM, Overpass, government/public, business, community, system, and derived datasets.
- Wired both platform contracts into the application bootstrap before product cores load.

## 2026-08-16 — Business CRUD authority hardening

- Added `cores/business/business-crud-core.js` with real list/get/create/update/delete operations for registered business CRUD datasets: Promotions, Events, Campaigns, Contests, QR Studio, and Partner Programs.
- Enforced authenticated membership against the requested `business_id` before entitlement checks; removed client-side `is_admin` bypass behavior.
- Resolved Business tier from `business_members → businesses.business_tier`, not from client-controlled account state.
- Removed client-controlled `created_by` / `updated_by` mutation fields.
- Centralized Growth vs Enterprise feature access in `cores/business/business-feature-registry.js`.
- Corrected advanced feature requirements so Partner Programs and enterprise partner outcomes are Enterprise-gated instead of treating every advanced feature as Growth.
- Expanded the CRUD mutable-field contract to cover real configured fields including campaign types/goals, event dates/times, contest scoring/rewards, QR action payload/customization, and business metadata.
- Added progression metrics for create/update/delete operations.

## 2026-08-16 — Business feature-gap wiring

- Audited the Business feature-gap bridge and found its CRUD buttons dispatched an event but had no guaranteed production consumer.
- Rewired Promotions, Events, Campaigns, Contests, QR Studio, and Partner Programs to real in-app CRUD editors backed by the canonical Business CRUD Core.
- Corrected a dataset/key mismatch where the bridge was passing table names (`qr_codes`, `partner_programs`, etc.) to a core expecting canonical feature keys (`qr`, `partnerships`, etc.).
- Added production list/create/update/delete editor flows with feature-specific fields and JSON handling.
- Added real two-step destructive confirmation without browser `confirm()`.
- Added in-app error notices instead of browser dialogs.
- Preserved authenticated business membership, tier, role, business scoping, and canonical CRUD authorization.
- No placeholder save paths were added.

## 2026-08-16 — Business UX consistency

- Removed remaining browser-dialog error/upgrade interactions from the Business gap-closer.
- Preserved the canonical Business Workspace as the primary analytics/legacy RPC surface while the feature-gap layer supplies missing production CRUD entry points.
- Identified remaining architectural task: migrate specialized legacy Business Workspace mutation handlers to the canonical CRUD authority only where the underlying table schema/RLS contract is verified; do not blindly replace working RPC-backed mutations.

## 2026-08-16 — Live Supabase security hardening

- Hardened mutable database functions with explicit `search_path = public, pg_temp` for business location metrics, business review replies, and the shared `touch_updated_at()` trigger function.
- Removed anonymous execution from four sensitive SECURITY DEFINER functions: business leaderboard, bathroom verification details, full location details, and user leaderboard.
- Preserved intentionally public discovery RPCs supporting the unauthenticated consumer experience.
- Remaining live security gate is the authenticated SECURITY DEFINER authorization matrix plus leaked-password protection.
- Current connected Supabase permissions later prevented re-running the live advisor/function inspection; no blind database changes were made after that boundary.

## Verification status

- Static source inspection and committed implementation changes are complete for the batches above.
- Runtime/browser end-to-end verification remains required for Business CRUD against the deployed schema/RLS contract.
- Live Supabase SECURITY DEFINER inspection is currently connector-permission constrained and must be resumed with sufficient database inspection privileges.
- A feature is not considered complete merely because it renders or registers; the audit requires real data mutation, authorization, side effects, and refresh behavior.
