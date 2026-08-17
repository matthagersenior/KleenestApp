# Kleenest Full-App Audit Log

**Authoritative branch:** `refactor/monolith-removal`

## Operating rules

- Audit the entire application, not just Admin.
- Cross-reference UI → handler → module/core → RPC/API → authorization → dataset → side effects → analytics/UI refresh.
- Fix verified defects immediately when safe.
- Do not add placeholders or fake wiring.
- Do not merge `main` into `refactor/monolith-removal` during this audit.
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

## 2026-08-17 — Six-tab core ownership consolidation

- Established the target architecture as exactly six tab cores: Home, Maps, Social, Profile, Business, Admin.
- Added the canonical tab-core registry and tab lifecycle boundaries.
- Consolidated Maps into one tab owner and removed duplicate Maps core/discovery/location wrappers.
- Consolidated Social so `social-core.js` is compatibility-only and `social-core-v2.js` is the active implementation.
- Consolidated Business into one canonical Business Core; removed the competing Business runtime/workspace bridge layers while retaining CRUD/Value/Feature services as subordinate modules.
- Consolidated Profile onto the canonical Profile Core and removed the independent v1 implementation.
- Consolidated Admin onto the canonical Admin Core and converted the old v1 implementation to compatibility-only.

## 2026-08-17 — Cross-tab lifecycle cleanup

- Removed the modular shell's duplicate per-tab lifecycle implementations; the shell now delegates tab mounting exclusively to the canonical six-tab registry.
- Removed obsolete generic module/surface bridge layers.
- Removed unused legacy Business data/management bridges that duplicated canonical Business data/mutation responsibilities.
- Verified the remaining Supabase compatibility files converge on a single underlying browser client rather than creating independent clients.

## 2026-08-17 — Authentication authority cleanup

- Traced `kleenest-auth-bridge-v1.js` and confirmed it was a compatibility facade around the same Supabase/Runtime authentication path, not an independent auth store.
- Converted the auth bridge to compatibility-only delegation so authentication state and password/session operations remain owned by `KleenestSupabase` / `KleenestRuntime`.
- Preserved the legacy `KleenestAuth` namespace for compatibility, including OAuth.
- No schema, RLS, or RPC authorization changes made in this pass.
- Remaining risk: repository-wide event-listener and cross-cutting service consumer tracing is still required before removing additional compatibility layers.

## 2026-08-17 — Shared capability / lifecycle ownership pass

- Inspected the authoritative branch tree directly after confirming GitHub code-search indexing is unavailable for this repository; broad code-search results must not be treated as proof of absence.
- Confirmed Rewards is an app-level synchronization service: it reads the canonical Supabase facade, updates shared runtime user state, and publishes reward events.
- Removed Rewards' implicit call to a free/global `render()` function. Reward synchronization now publishes explicit `kleenest:rewards-updated` events without forcing an unrelated surface renderer to run.
- Confirmed the Notifications UI is app-lifetime infrastructure and routes notification mutations through `KleenestActions`; it is not a seventh tab core.
- Confirmed `KleenestEvents` is the shared event/error boundary and provides removable subscriptions for feature-scoped consumers.
- Confirmed Maps has explicit teardown for navigation, renderer, routes, location, and session, preserving the Maps-only GPS lifecycle.
- Confirmed Growth/Perks explicitly covers `growth`, `enterprise`, and `fleet` business tiers; it is a Business capability rather than another tab core.
- Confirmed Fleet is a Business/enterprise capability, not a seventh tab. Fleet workspace buttons previously referenced obsolete `KleenestModularShellV11`; they now route through canonical `KleenestModularShellV13`.
- No Supabase schema/RLS/RPC authorization changes made in this pass.
- Remaining risk: many historical v1/v2/v3 files remain in the repository as reference/compatibility artifacts; each must be classified by actual bootstrap/consumer reachability before deletion.

## 2026-08-17 — Historical shell / entrypoint orphan cleanup

- Inspected the actual `index.html` bootstrap and confirmed the active shell is `kleenest-modular-shell-v13.js`; the bootstrap does not load the older app-shell generations or modular-shell v1–v12.
- Confirmed the active Home implementation is intentionally named `kleenest-home-core-v1.js` despite its internal canonical Home Core v3 label; it remains actively loaded and was preserved.
- Confirmed `index.html` is the authoritative bootstrap on this branch; the large `index-fixed.html`, `index2.html`, `index5.html`, `index6.html`, `index7.html`, `Index3.html`, `Index4.html`, and `Kleenest_index_pass3.html` artifacts were not treated as runtime entrypoints in this pass.
- Removed orphaned historical app-shell generations: `kleenest-app-shell.js`, v40, v48, v63, v66, v67, v68, v69, v70, v72, and v73.
- Removed obsolete modular shell generations v1 through v12; v13 remains the canonical shell.
- Removed orphaned `kleenest-modular-entry.js` and `kleenest-modular-entry-v31.js`; the active bootstrap loads the canonical tab registry/shell directly.
- No changes made to active Home, Maps, Social, Profile, Business, Admin, Supabase, Auth, Rewards, Notifications, or Fleet implementations in this cleanup batch.
- Verification: exact filename searches for removed shell/entrypoint artifacts returned no repository consumers before deletion; active `index.html` references only `kleenest-modular-shell-v13.js` and the canonical tab registry.
- Remaining risk: non-runtime HTML snapshots and historical feature bridges still require classification; preserve any file that is serving as an explicit audit/reference artifact until that purpose is documented.
