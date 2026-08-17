# Fleet Operational Verification — 2026-08-17

## Scope
Verified the active Fleet path used by the canonical Business Control Center:

- `cores/business/business-core-v8.js`
- `kleenest-business-control-center-v5.js`
- `kleenest-fleet-workspace-v1.js`
- production Supabase Fleet RPCs, grants, and row-security state

The active Business Control Center lazy-loads `kleenest-fleet-workspace-v1.js` directly and exposes Fleet as the third Business dashboard. The historical `kleenest-fleet-business-bridge-v1.js` is not part of the active bootstrap and was intentionally left unchanged after inspection.

## Mutation inventory

| UI mutation | Backend contract | Authorization | State transition |
|---|---|---|---|
| Driver status | `fleet_set_driver_status(uuid,uuid,text)` | `fleet_actor_is_manager(business_id)` | active / inactive / on_leave / suspended |
| Vehicle status | `fleet_set_vehicle_status(uuid,uuid,text)` | `fleet_actor_is_manager(business_id)` | active / inactive / maintenance / out_of_service |
| Complete maintenance | `fleet_complete_maintenance(uuid,uuid,text)` | `fleet_actor_is_manager(business_id)` | completed + completed_at + optional notes |
| Resolve alert | `fleet_resolve_alert(uuid,uuid,text)` | `fleet_actor_is_manager(business_id)` | resolved + resolved_at + optional resolution |

All four are `SECURITY DEFINER`, require the supplied business ID to match the target row, and reject invalid status values where applicable. No client-side direct UPDATE path is required for these mutations.

## Findings and fixes

### P0 — Fleet mutation RPCs had anonymous EXECUTE grants

Production inspection showed the four mutation RPCs were executable by `anon`. Their internal manager checks prevented successful unauthorized mutations, but anonymous EXECUTE was still broader than necessary.

**Fixed in Supabase migration:**

- revoked `anon` EXECUTE from all four Fleet mutation RPCs;
- revoked `anon` EXECUTE from `fleet_dashboard_summary_v2`;
- retained `authenticated` EXECUTE.

Post-migration verification confirms all five functions return `anon_execute=false` and `authenticated_execute=true`.

### P0 — Direct operational table writes were granted to authenticated users

Production grants showed `authenticated` had INSERT/UPDATE/DELETE/TRUNCATE privileges on `fleet_drivers`, `fleet_vehicles`, and `fleet_alerts`, while the active UI correctly uses manager-authorized RPCs.

**Fixed:** direct authenticated mutation privileges were revoked. Existing SELECT access remains protected by the Fleet RLS policies.

The obsolete `*_write` RLS policies for those three tables were also removed so the database no longer advertises a second direct-write authority.

### P0 — Fleet service-opportunity view was globally readable

`fleet_service_opportunities` is a view, not a table. It had no RLS and had broad anonymous/authenticated SELECT grants. Its original definition did not filter by business.

**Fixed:**

- anonymous access revoked;
- the existing view was retained as the canonical read surface rather than creating another competing dataset;
- the view now includes `has_fleet_access(l.business_id)` in its WHERE clause and is security-barriered;
- a business-scoped `fleet_service_opportunities_for_business(uuid)` RPC was also added as an explicit server-authoritative read contract for future consumers;
- direct authenticated write privileges were revoked.

### P1 — Fleet summary mixed global and business-scoped metrics

The original `fleet_dashboard_summary_v2` correctly scoped vehicles, drivers, routes, alerts, operational events and maintenance, but the location and service-opportunity aggregates were not filtered by `p_business_id`.

**Fixed:** both aggregates now require `business_id=p_business_id`.

This prevents Fleet KPIs from incorporating unrelated businesses' locations/opportunities.

## UI refresh behavior

After each successful mutation, the active Fleet workspace re-runs the current dashboard view, so the authoritative returned state is reflected in the UI rather than relying on optimistic client state.

The mutation controls currently use the existing browser prompt/alert flow for status/notes/error entry. This is a P1 UX cleanup, not an authorization defect. An attempted full-file in-place UI replacement was rejected by the GitHub connector with a 502 before a write occurred, so **no speculative or partial UI code was committed**.

## Verification

- Active bootstrap inspected: `index.html` loads the canonical Business Control Center path and Fleet workspace.
- Active Business Control Center inspected: Fleet is lazy-loaded from `kleenest-fleet-workspace-v1.js`.
- All four Fleet mutation RPC definitions inspected in production.
- All four mutation authorization checks inspected.
- Anonymous EXECUTE privileges rechecked after migration: denied.
- Authenticated EXECUTE privileges rechecked after migration: granted.
- Direct operational table mutation privileges rechecked: revoked.
- Fleet service-opportunity view definition rechecked: business-scoped with `has_fleet_access`.
- Fleet summary definition rechecked: location and opportunity aggregates now business-scoped.
- Browser runtime verification was attempted against the deployed GitHub Pages application, but the connected Opera session was unavailable, so no claim of live-browser click verification is made.

## Remaining P1

1. Replace the four remaining browser prompt/alert mutation flows with the existing in-app Fleet confirmation/editor pattern, once the active file can be safely updated through the repository connector.
2. Perform authenticated live-browser mutation tests for each state transition once the Opera connector is connected.
3. Continue to provenance/evidence verification after Fleet mutation authority is complete.
