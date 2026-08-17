# Audit Pass — P0 Runtime Boot Fix Batch 3

Branch: `refactor/monolith-removal`
Reference-only branch: `main` (not modified)

## Finding

The deployed application could still present the generic "Kleenest could not start" failure even after the v69 consolidation. The canonical v69 shell contained a fragile escaping expression and was not a sufficiently safe bootstrap for a mobile production shell.

## Fix

- Retired v69 from the active bootstrap.
- Added syntax-safe `kleenest-app-shell-v70.js`.
- Made v70 the sole active application router in `index.html`.
- Desktop navigation is header-only.
- Mobile navigation is footer-only.
- Auth transitions return users to Home when the current surface is no longer authorized.
- Maps mounts the canonical renderer first; preloading is optional and asynchronous afterward.
- Maps accepts the current V7/V8/V9 mount aliases during consolidation.
- Surface failures remain isolated and expose a Retry action.

## Deployment commits

- `7e1f687e7d3affdf1c75d4f278d0d4b8aa44b4b9` — v70 shell
- `e4d566345d878cca04c759efab16074cf13e8152` — retire v69
- `abd8fbbecfc2893db9dc794945f756e4178c5b77` — v70 authoritative index

## Regression sequence

Fresh load → Home → Maps → Community → Profile → sign in → repeat → Business/Admin entitlement → sign out → repeat at least three cycles.

No changes were made to `main`.