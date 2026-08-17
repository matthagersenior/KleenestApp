# Audit Pass — Maps Detail Actions + Authority — 2026-08-17

## Active consumer chain

`maps-tab-core-v2.js` → `maps-core.js` → `maps-details.js` → `maps-engagement.js` / `maps-verification.js` / `maps-routes.js` → live Supabase authority.

## Live RPC contract verified

The active detail actions use these live authenticated RPCs:

- `get_location_details(uuid)`
- `kleenest_map_check_in(uuid, double precision, double precision)`
- `kleenest_toggle_favorite(uuid)`
- `record_location_visit(uuid, jsonb)`
- `record_bathroom_verification(uuid, boolean, double precision, double precision, double precision)`

All five are SECURITY DEFINER, have PUBLIC/anon EXECUTE revoked, and allow authenticated execution.

## Check-in

`maps-engagement.js` obtains the current Maps location when available and passes latitude/longitude to `kleenest_map_check_in`. The RPC is the mutation authority. Direct client insertion into `check_ins` is not used.

## Favorite defect fixed

The live toggle RPC returns the authoritative `favorite` state. The client previously ignored that state for progression and instead derived the metric from the requested `active` argument, even though the RPC is a toggle operation.

The client now records `location_favorited` or `location_unfavorited` from the RPC's returned state, while retaining the requested value only as diagnostic payload.

## Verification defect fixed

The repository previously exposed a `community` verification mode, but the live database has no community verification RPC. The only active bathroom verification authority is `record_bathroom_verification`, and its live implementation is a trusted, geofenced flow requiring an eligible account/business role and GPS.

The Maps verification module was aligned to the actual live contract:

- removed the nonexistent community mode;
- `verify()` now routes only to the trusted authority;
- an explicit boolean bathroom answer is mandatory;
- missing GPS coordinates are resolved through browser geolocation;
- missing GPS or missing answer fails explicitly instead of silently submitting `false`.

No client-side verification mutation was introduced.

## RLS verification

Live state was checked for the tables touched by these authorities:

- `check_ins`: RLS enabled; owner SELECT policy. Insert is performed by the security-definer check-in RPC.
- `favorites`: RLS enabled; owner ALL policy.
- `location_bathroom_verifications`: RLS enabled; own INSERT + SELECT policies. Trusted verification RPC remains the authority for its associated location updates/points.
- `location_verification_points`: RLS enabled; own SELECT policy. Point creation remains server-side in the verification RPC.
- `location_visits`: RLS enabled; read policies; insertion remains server-side through `record_location_visit`.
- `analytics_events`: RLS enabled; member INSERT + SELECT policies. Favorite analytics are generated inside the server-side toggle RPC.

## Not claimed

Browser-level interaction testing remains separate. CI is not claimed where no workflow run exists. This pass only declares code-to-live-contract wiring verified from the authoritative branch and live database metadata/function definitions.

All product changes are on `refactor/monolith-removal`; `/main` is excluded.
