# Business Surface Audit Pass — 2026-08-16

**Authoritative branch:** `refactor/monolith-removal`

## Scope

Meticulous cross-reference of the Business surface and shared runtime paths that can render Business UI outside the Business workspace.

## Areas inspected

- `index.html` modular bootstrap and global Business script loading
- `kleenest-modular-shell-v1.js` route ownership and Business navigation
- `kleenest-business-workspace-adapter-v1.js` Business workspace mounting
- `kleenest-business-workspace-v1.js` canonical Business workspace
- `kleenest-business-feature-gap-bridge-v1.js` Business CRUD/tool-card bridge
- `kleenest-business-feature-entitlement-enforcer-v1.js` tier/role presentation guard
- `kleenest-business-render.js` shared Business live-data renderer
- `cores/business/business-feature-registry.js` canonical feature/entitlement contract
- `cores/business/business-crud-core.js` canonical CRUD authority
- `kleenest-business.js` legacy Business data layer

## P0 finding — Business Tool cards were globally scoped

`kleenest-business-feature-gap-bridge-v1.js` observed the shared `#modular-workspace` / `#km-workspace` container and appended the Business programs/tools section there. Because that container is reused by Home, Maps, Social, Profile, Business, and Admin routing, the Business Tool catalog could appear on unrelated tabs.

### Fix

Changed the bridge's mounting target to the explicit Business route container `#km-business`. The bridge still observes DOM changes for late Business rendering, but it can no longer attach the Business Tool catalog to other tabs.

## P0 finding — Business live renderer had an unsafe global fallback

`kleenest-business-render.js` previously appended its live Business panel to `document.body` whenever a Business dashboard container was not found. That made shared runtime events capable of injecting Business UI into any active surface.

### Fix

The renderer now requires an explicit Business workspace/dashboard target and clears stale output when no Business target exists. It never falls back to `document.body`.

## Architecture verification

`kleenest-modular-shell-v1.js` owns route selection and creates a dedicated `#km-business` container only for the Business route. The canonical Business workspace adapter mounts its Business workspace into that route container. This establishes the intended ownership boundary:

`Shell route → #km-business → Business Workspace → Business tools`

Other product surfaces do not own Business Tool cards.

## Entitlement verification

The canonical Business feature registry continues to classify:

- Standard: Overview, Locations, Reviews, Basic Analytics, Certifications
- Growth+: Promotions, Events, Campaigns, Contests, QR Studio, Metric Leaderboards, Preferred Use Analytics, Engagement Attribution
- Enterprise: Partner Programs and enterprise partner outcomes

The presentation enforcer remains a secondary UX guard; server-side Business CRUD authorization remains authoritative.

## Data/authority verification

The Business CRUD bridge continues to use the canonical Business CRUD authority for list/get/create/update/delete operations. No fake data path or stub was introduced.

## Added regression contract

The Business surface rule is now explicit and testable by inspection:

> Generic shared workspace containers must never be used as the mount target for Business Tool catalogs. Business Tool UI must mount only under the Business route/workspace.

## Verification performed

- Inspected the modular shell route graph.
- Confirmed Business has a dedicated `#km-business` route container.
- Confirmed the Business Tool bridge was using the shared workspace before the fix.
- Confirmed the Business live renderer had a `document.body` fallback before the fix.
- Committed both source fixes to the authoritative modular branch.
- Re-fetched the modified Business Tool bridge and confirmed its updated blob SHA.

## Remaining verification

- Browser/device runtime verification should confirm Home, Maps, Social, Profile, and Admin contain no generic Business Tool catalog after navigation into and back out of Business.
- Business CRUD should be exercised with Standard, Growth, and Enterprise memberships against live Supabase RLS/authorization.
- Any remaining Business UI discovered outside `#km-business` is a P1 architectural violation and should be routed through this contract.
