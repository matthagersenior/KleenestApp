# Kleenest P0 Runtime Consolidation Audit — 2026-08-17

## Authority
- Production application source: `refactor/monolith-removal` only.
- `main` is reference-only and is not a deployment/change target.
- Canonical bootstrap: `index.html` boot=101.
- Canonical shell: `kleenest-modular-shell-v6.js`.

## Verified findings
1. The repository had multiple shell generations and compatibility layers. Production execution must have one shell/navigation owner.
2. The Supabase SDK namespace and initialized Kleenest client were being conflated through legacy global compatibility. The canonical shell now consumes `KleenestSupabaseClient` and only temporarily supplies the legacy Admin renderer's expected global while that legacy renderer executes.
3. Business/Admin entitlement is present in the database for the current demo administrator account: `profiles.is_admin=true`, role `admin`, `is_business_user=true`, subscription `enterprise`; a `business_members` row also exists with role `owner`.
4. The current Admin Core is feature-rich (People, Places, Businesses, Community, Content, Growth, Security, Data/CRUD) but its authorization gate can display the legacy Control Center message when it cannot resolve entitlement. This must not be confused with an empty Admin implementation.
5. Home Quick Play cards already exist for eight games, but the Home Core calls `KleenestGameEngine.startGame()` and the game engine was not wired by the active bootstrap. The canonical bootstrap now explicitly loads the existing game engine.
6. Maps must identify each module independently. The canonical shell uses cache generation `core=20` and reports the exact failing module. Leaflet is explicitly loaded before Maps.
7. The current deployed-source entry point is now explicitly identified as shell v6 / boot 101 to make source-vs-browser mismatches diagnosable.

## P0 changes in this batch
- Added canonical Shell v6.
- Switched `index.html` to Shell v6.
- Added explicit Quick Play game-engine loading.
- Added explicit Leaflet initialization.
- Added runtime identity metadata.
- Preserved server-side authorization; no client-side Admin bypass was added.
- Preserved Business membership/tier enforcement.

## Supabase verification
The current administrator/business demo profile is verified in the live Supabase project as administrator and enterprise business user, with an owner membership record.

## Remaining P0 acceptance gates
- Verify GitHub Pages serves this exact `index.html` and Shell v6 artifact.
- Verify authenticated login renders Business + Admin navigation.
- Verify Admin mounts the feature-rich dashboard rather than the legacy access placeholder.
- Verify Maps loads all modules without syntax/runtime errors and populates real nearby locations.
- Verify location selection opens canonical location details.
- Verify Quick Play opens each registered game and progression writes persist.
- Verify logout/login repeatedly without changing shell/navigation generation.
- Remove remaining compatibility globals after dependent legacy cores are migrated.

## P1/P2 rule
Dataset selection is an implementation/data-source concept, not the primary UI. Domain/tool cards are the canonical Admin interface; the visible dataset dropdown should be retired after equivalent card workflows are verified.
