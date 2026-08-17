# Kleenest P0 Runtime Consolidation Audit — 2026-08-17

## Authority
- Production application source: `refactor/monolith-removal` only.
- `main` is reference-only and is not a deployment/change target.
- Canonical bootstrap: `index.html` boot=102.
- Canonical shell: `kleenest-modular-shell-v6.js`.
- Latest authoritative branch commit: `6d8aebacaf707f907c832e8f47d912457e1d213a`.

## Critical deployment finding
The GitHub Pages workflow was configured to trigger on and checkout `main`. This directly contradicted the project rule that `main` is reference-only and explains the long-running pattern where the browser displayed older/fallback surfaces despite fixes being committed to `refactor/monolith-removal`.

The workflow has now been changed to trigger on and checkout `refactor/monolith-removal`. This is the most important deployment correction in this audit.

## Verified findings
1. The repository had multiple shell generations and compatibility layers. Production execution must have one shell/navigation owner.
2. The Supabase SDK namespace and initialized Kleenest client were being conflated through legacy global compatibility. The canonical shell consumes `KleenestSupabaseClient`; the Admin Core currently retains a tightly scoped legacy compatibility bridge only while its existing renderer executes.
3. Live Supabase verification confirms the current administrator/business demo profile is `is_admin=true`, role `admin`, `is_business_user=true`, subscription `enterprise`, with a `business_members` owner row. Therefore an Admin authorization-placeholder screen for this account is not explained by missing database entitlement.
4. The current Admin Core is feature-rich (People, Places, Businesses, Community, Content, Growth, Security, Data/CRUD). Its authorization gate should not be mistaken for an empty implementation.
5. Home Quick Play cards already exist for eight games, and the existing `kleenest-game-engine-v1.js` was not wired by the prior active bootstrap. The canonical bootstrap now explicitly loads it.
6. Maps modules are loaded individually and report the exact failing module. Leaflet is explicitly initialized before Maps. The current repository copy of `maps-navigation.js` is syntactically valid.
7. The active entry point now carries explicit boot/shell identity so source-vs-browser mismatches can be diagnosed.
8. Admin's visible dataset selector is now hidden behind a card-first UI bridge. The underlying dataset model remains available to the Admin Core; users operate through domain/tool cards.

## P0/P1 changes in this batch
- Added canonical Shell v6.
- Switched `index.html` to Shell v6 / boot 102.
- Added explicit Quick Play engine loading.
- Added explicit Leaflet initialization.
- Added runtime identity metadata.
- Added Admin card-first UI bridge.
- Corrected GitHub Pages deployment from `main` to `refactor/monolith-removal`.
- Preserved server-side authorization; no client-side Admin bypass was added.
- Preserved Business membership/tier enforcement.

## Acceptance gates after Pages deployment
1. Browser source must identify boot=102 and Shell v6.
2. Authenticated administrator must see Business and Admin tabs.
3. Admin must mount the feature-rich dashboard, not `Administrator access is required`.
4. Maps must load all modules without `Unexpected token ')'` and populate real nearby locations.
5. Location selection must open canonical location details.
6. All eight Quick Play entries must launch.
7. Quick Play progression must persist through the existing progression/reward layer.
8. Logout/login repeated three times must preserve the same shell and navigation ownership.
9. Social, Profile, Business, and Admin must fail independently rather than freezing the shell.
10. Remaining compatibility globals must be removed as legacy callers are migrated.

## P1/P2 rule
Dataset selection is an implementation/data-source concept, not the primary UI. Domain/tool cards are the canonical Admin interface. The visible dataset dropdown is retired from the user-facing Admin workflow while the underlying data abstraction remains available to the application.
