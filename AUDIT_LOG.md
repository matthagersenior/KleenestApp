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

- Added `cores/platform/platform-quality-gates.js` as a shared runtime guard layer for modular cores.
- Added `cores/platform/platform-data-provenance.js` as the canonical provenance/freshness contract.
- Wired both platform contracts into application bootstrap before product cores load.

## 2026-08-16 — Business CRUD authority hardening

- Added `cores/business/business-crud-core.js` with real list/get/create/update/delete operations for Promotions, Events, Campaigns, Contests, QR Studio, and Partner Programs.
- Enforced authenticated membership against the requested `business_id` before entitlement checks; removed client-side `is_admin` bypass behavior.
- Resolved Business tier from `business_members → businesses.business_tier`.
- Removed client-controlled `created_by` / `updated_by` mutation fields.
- Centralized Growth vs Enterprise feature access in `cores/business/business-feature-registry.js`.
- Corrected advanced feature requirements so Partner Programs and enterprise partner outcomes are Enterprise-gated.
- Expanded the CRUD mutable-field contract to cover real configured fields.
- Added progression metrics for create/update/delete operations.

## 2026-08-16 — Business feature-gap wiring

- Rewired Promotions, Events, Campaigns, Contests, QR Studio, and Partner Programs to real in-app CRUD editors backed by the canonical Business CRUD Core.
- Corrected dataset/key mismatches between feature UI and canonical CRUD keys.
- Added production list/create/update/delete editor flows with feature-specific fields and JSON handling.
- Added real two-step destructive confirmation and in-app error notices.
- Preserved authenticated business membership, tier, role, business scoping, and canonical CRUD authorization.

## 2026-08-16 — Business entitlement presentation hardening

- Found that the feature-gap bridge rendered Growth/Enterprise CRUD cards as unlocked even though the canonical registry and server authority correctly classified them as advanced.
- Added `kleenest-business-feature-entitlement-enforcer-v1.js` and wired it into the production bootstrap.
- Standard business users now see advanced Promotions, Events, Campaigns, Contests and QR Studio controls disabled/locked; Partner Programs requires Enterprise.
- The guard derives the business tier from the authenticated `business_members → businesses.business_tier` relationship and treats server-side CRUD authorization as authoritative.
- This is a presentation/interaction guard, not a replacement for server authorization.

## 2026-08-16 — Live Supabase security hardening

- Hardened mutable database functions with explicit `search_path = public, pg_temp`.
- Removed anonymous execution from four sensitive SECURITY DEFINER functions while preserving intentionally public discovery RPCs.
- Remaining live security gate is the authenticated SECURITY DEFINER authorization matrix plus leaked-password protection.
- Current connected Supabase permissions later prevented re-running the live advisor/function inspection; no blind database changes were made after that boundary.

## 2026-08-16 — P0 Maps initialization parse failure

- Reproduced the reported failure path from the modular shell: Maps imports `cores/maps/maps-core.js` directly before creating the Maps surface.
- Inspected the authoritative Maps Core and found extensive nested template-literal HTML generation in the route/details renderer, matching the browser's `Missing } in template expression` parse failure class.
- Replaced the Maps Core renderer/HTML construction with syntax-safe string construction while preserving the existing module contract, GPS/discovery/cache flow, verification, engagement, routes, navigation, progression, and business module wiring.
- Bumped the Maps Core contract to `1.7.2` and committed the source repair as `f3852fee93429b75ee25bb93524c37473a83f61b`.

## 2026-08-16 — P0 Maps cache/secondary renderer hardening

- Audited the remaining Maps modules loaded by the shell, including discovery, routes, renderer, and navigation UI.
- Hardened `cores/maps/maps-renderer.js` by removing nested template expressions from live navigation text formatting while preserving behavior.
- Bumped all Maps module import cache keys in the modular shell so a browser that previously cached the broken `?core=9` module graph cannot reuse the failed parse result on Retry.
- Advanced the Maps navigation/routing cache keys alongside the main Maps graph to keep the imported module set version-coherent.
- New Maps graph cache versions: core/location/discovery/cache/session/catalog/verification/engagement/details/filters/renderer/routes/progression `core=10`; navigation/routing `core=8`; navigation UI `core=7`; voice `core=6`; reroute `core=7`; arrival `core=6`.
- Source commits: renderer hardening `c27e585aad6e6c2cb2e2e9858296006449f665be`; cache-bust shell `1a4db15dc1379591d19fee57e89493ef31c77269`.

## 2026-08-17 — Canonical module lifecycle wiring

- Inspected the authoritative modular branch at `fd84d258f9d8ad647576d68e77dd78314598240d` and found that the newly added canonical module registry/adapter existed but was not loaded by `index.html` and was not used by the v13 shell.
- Added `core/kleenest-module-registry-v1.js` and `core/kleenest-module-adapter-v1.js` to the canonical bootstrap before product modules load.
- Routed Home, Maps, Social, Profile, Business, and Admin through the single registry/adapter mount path in `kleenest-modular-shell-v13.js` instead of having the shell directly invoke each surface as its lifecycle boundary.
- Preserved the existing canonical feature cores and entitlement checks; this pass changes lifecycle ownership, not feature behavior or authorization policy.
- Added runtime health exposure for the registered module set and advanced shell/module cache keys to prevent stale browser graphs.
- During verification, found a contract gap in `core/kleenest-module-registry-v1.js`: the adapter requires `registry.get(name)` but the registry exposed no `get` method. Added the missing lookup method so registry and adapter share one contract.

## 2026-08-17 — Business duplicate surface removal

- Audited the Business bootstrap chain after lifecycle consolidation.
- Found that `kleenest-business-workspace-adapter-v1.js` already dynamically loads the canonical Business Workspace plus its gap-closer and entitlement guard.
- The bootstrap was also loading the older `kleenest-business-feature-gap-bridge-v1.js` and `kleenest-business-feature-entitlement-enforcer-v1.js`, creating a second Business feature/entitlement surface with different contracts and an independent DOM observer.
- Removed both stale loaders from `index.html` and advanced the bootstrap cache key. The canonical Business Workspace adapter remains the single Business surface entry.

## Verification status

- Static source inspection and committed implementation changes are complete for the batches above.
- Runtime/browser end-to-end verification remains required for Business CRUD against the deployed schema/RLS contract.
- Live Supabase SECURITY DEFINER inspection is currently connector-permission constrained and must be resumed with sufficient database inspection privileges.
- Maps P0 source repair and cache-bust are complete in the authoritative modular source; deployed-device verification remains required.
- The canonical registry/adapter wiring is now statically contract-consistent; browser runtime verification is still required to confirm all six surfaces mount/unmount correctly through the new lifecycle path.
- Business now has one canonical workspace loader in the modular bootstrap; deployed/browser verification is still required to confirm no feature-gap functionality was lost when the stale bridge was removed.
- A feature is not considered complete merely because it renders or registers; the audit requires real data mutation, authorization, side effects, and refresh behavior.