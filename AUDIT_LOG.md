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
- Confirmed no repository hits for placeholder/TODO/FIXME markers in the audited search surface.
- Confirmed no repository hits for browser `alert`, `confirm`, or `prompt` in the audited search surface.
- Confirmed no repository hits for direct `console.log` calls in the audited search surface.
- Inspected CI: Supabase frontend integration remains a main-branch legacy injection workflow and is not part of the modular branch runtime; it remains a P0 architectural risk because it can reintroduce legacy script wiring when applied to main.
- Confirmed `index.html` loads the canonical design system before the modular shell and wires Business, Maps, Social, Progression, Home, Profile, Admin, and feature-gap bridges.
- No speculative removal of legacy startup scripts was performed because several current modular cores still consume the corresponding runtime bridges; dependency ownership remains an active monolith-removal task.

## 2026-08-16 — Business workspace hard-wiring pass

- Traced modular shell → Business route → Business adapter → Business Workspace.
- Found a real integration defect: the modular shell created a dedicated `km-business` root and passed the canonical Business Value Core, while the compatibility adapter ignored both arguments and searched for the generic `km-workspace` root.
- Fixed the adapter to accept the shell-provided root and options and forward them to the canonical Business Workspace mount.
- Preserved the adapter as a compatibility bridge rather than introducing another Business implementation.
- This closes a genuine routing/wiring defect; Business advanced CRUD still requires RPC-level end-to-end verification before the P0 gate can be marked complete.

## Active P0 gates

1. Harden public-data ingestion/prepopulation and abuse/rate controls.
2. Validate every Business advanced CRUD/action path end-to-end.
3. Finish unified loading/error/empty behavior across all cores.
4. Continue removing monolith-style startup/global dependencies through explicit/lazy ownership.
5. Complete browser/device regression coverage.

## Active P1/P2 implementation queue

- Clean Route productization.
- Kleenest Score and Location Health shared trust/intelligence model.
- QR attribution and business conversion reporting.
- Accessibility intelligence and filters.
- Admin data-integrity/verification operations.
- Abuse/reward protection.
- Notification center and richer account/history surfaces.
- Deeper social, games, partner marketplace, enterprise APIs, and fleet intelligence.

## Completion rule

P0/P1/P2 items are only marked complete after real data → backend/RPC → authorization → state → UI → action/CRUD → side effects → analytics → loading/error/empty → mobile/accessibility → regression verification has been traced and verified. A visible control without real persistence and downstream wiring is incomplete.
