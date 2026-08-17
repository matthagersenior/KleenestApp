# P0 Audit — Canonical Runtime Cache + Admin RPC

Date: 2026-08-17
Branch: refactor/monolith-removal

## Findings

1. The authoritative index correctly uses the feature-rich modular shell, but browser-cached asset generations could leave users running older shell/core code after deployment.
2. The Supabase compatibility bridge must run before Admin Core so legacy Admin code receives the initialized Supabase client rather than the CDN namespace.
3. Maps requires a bounded viewport on mobile so Leaflet cannot exceed the application display.
4. Location details are a backend contract, not a shell fallback: selectable locations must resolve through the canonical location-detail path.

## Changes

- Bumped all canonical bootstrap asset query versions from 75 to 76.
- Kept `kleenest-modular-shell-v1.js` as the sole router; no simplified replacement shell was introduced.
- Kept the real Home Core, Profile Core, Social Core, Business Workspace, Admin Core, and Maps Core.
- Kept `kleenest-supabase-client-compat-v1.js` before Admin Core so `g.supabase` resolves to the initialized client when the legacy Admin surface asks for `.rpc()`.
- Added hard viewport constraints for Leaflet/map containers, including mobile-specific height limits.

## Acceptance path

Fresh Chrome load → Home → Find a restroom → canonical Maps → GPS/discovery → results → select location → canonical location details → Community → Profile → Business/Admin → logout → login → repeat.

No fallback surface is permitted to replace a feature-rich core. A core failure must be visible and independently retryable.
