# Surface restoration pass — 2026-08-17

**Authoritative branch:** `refactor/monolith-removal`

## Scope

Restored the user-facing application surfaces around the existing canonical six-tab architecture without introducing a second shell or second tab owner.

## Findings

- The canonical Business workspace already contained the rich analytics/CRUD surface, but its dataset navigation was a compact select control and therefore presented as a stripped-down control surface rather than feature cards.
- Social and Profile contained rich functionality but their internal section navigation was rendered as pill/toggle-style button rows.
- Admin Core v2 already contained the feature-rich platform control center and protected CRUD gateway, but the canonical Admin authorization runtime used a narrower role check than the shell, so authorized `owner`, `platform_admin`, and `super_admin` identities could be blocked before the real dashboard rendered.
- The shell's selected tab was held only in an in-memory variable, making tab state vulnerable to lifecycle/auth refresh races and page reloads.
- Maps was not missing its core routing/progression architecture: the canonical Maps Core directly owns location, discovery, filters, cache, renderer, routing, routes, progression, engagement, verification, details, navigation, and navigation UI. The active renderer also exposes detail, route, favorite and navigation actions. Historical Maps generations were already removed from the active dependency graph.

## Fixes

1. Added `kleenest-surface-card-nav-v1.js` as a visual/subordinate enhancer. It does not create a new lifecycle owner.
2. Business dataset navigation is now feature-card based, responsive, and preserves the existing dataset/location state and CRUD/analytics handlers.
3. Social and Profile section navigation is now card based with descriptions rather than pill/toggle styling.
4. Admin section navigation is now card based while preserving the existing feature-rich Admin dashboard and protected CRUD implementation.
5. Admin canonical authorization now accepts the same protected administrator role family used by the shell (`is_admin`, `admin`, `owner`, `platform_admin`, `super_admin`) and still requires authenticated Supabase identity plus profile authorization.
6. Shell v14 state now persists the selected tab in the URL/local storage, validates it against the currently available tabs, and preserves it through auth refreshes and queued lifecycle renders. `KleenestModularShellV13` remains a compatibility alias so the active bootstrap does not gain a second shell.
7. Canonical tab registry cache versions were advanced so the updated six cores are fetched after deployment.
8. Card-navigation observers are explicitly torn down by Business, Social, Profile, and Admin canonical cores to prevent cross-tab lifecycle leakage.

## Maps preservation

No legacy Maps implementation was reintroduced. The canonical Maps Core remains the sole owner of:

- GPS/watch lifecycle
- authoritative nearby discovery and public-data enrichment
- durable cache
- filters/search/radius
- Leaflet renderer and markers
- location details
- check-in/favorite/visit engagement
- bathroom/content verification
- progression/gamification
- route creation, stops, reorder, preview, optimization, start, completion, cancel and share events
- live navigation and navigation UI
- teardown

## Verification

- Source-level dependency graph inspected on `refactor/monolith-removal`.
- Six-tab registry remains the only tab mount authority.
- No legacy shell or legacy Maps renderer was added back.
- No Supabase schema, RLS, or RPC authorization weakening was introduced.
- Live GitHub Pages URL currently reports a JavaScript startup error; that deployment is not proof of the current refactor branch state and requires deployment/runtime verification after the branch is published.

## Remaining risk

The repository's GitHub code-search index remains incomplete. Historical artifacts must continue to be classified from actual bootstrap/dependency reachability rather than search absence alone. Browser runtime verification of the refactor branch remains required after deployment.
