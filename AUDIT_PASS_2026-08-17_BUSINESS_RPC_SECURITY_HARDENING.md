# Business RPC Security Hardening — 2026-08-17

## Scope
Meticulous follow-up audit of the Business subsystem after Business Tool surface isolation and entitlement hardening.

## Findings
- Multiple legacy Business RPC overloads remained callable alongside canonical, stronger implementations.
- Several legacy mutators used older `business_admin_guard`/`can_manage_business` paths and did not consistently enforce the Growth/Enterprise boundary.
- `business_location_metrics` was `SECURITY DEFINER` and had no caller authorization check; it was also executable by anonymous callers through the default PUBLIC grant.
- Business review reply was anonymously executable and lacked an explicit management authorization check.
- Partner usage summary/detail RPCs were anonymously executable.
- Enterprise Partner Program compatibility creators did not consistently enforce Enterprise tier.

## Fixes applied to Supabase
Migration: `harden_business_rpc_overloads_and_public_access_v3`

- Added authenticated business membership/role authorization to `business_location_metrics`.
- Required the requested location to belong to the requested business.
- Removed anonymous/public execution from:
  - `business_location_metrics`
  - `business_partner_program_usage`
  - `business_preferred_location_summary`
  - `business_preferred_location_usage`
  - `business_reply_review`
- Granted these RPCs to `authenticated` only.
- Hardened legacy two-argument `business_set_promotion_active` with business-management + Growth/Enterprise checks.
- Hardened legacy location creation with `business_can_manage`.
- Hardened legacy promotion creation with `business_can_manage` + Growth/Enterprise.
- Hardened legacy QR creation with `business_can_manage` + Growth/Enterprise.
- Hardened legacy event creation with `business_can_manage` + Growth/Enterprise.
- Hardened Partner Program/Partnership creation with `business_can_manage` + Enterprise tier enforcement.

## Verification
Post-migration privilege verification confirms the five explicitly targeted RPCs have:
- `anon_exec = false`
- `authenticated_exec = true`

## Remaining P1 work
The database still contains multiple historical Business RPC overloads and several SECURITY DEFINER analytics/detail functions whose authorization contracts should be consolidated or explicitly hardened. The next pass should inventory callers and migrate them to the canonical RPC signatures before deleting obsolete overloads.

Do not remove overloads until all frontend/edge-function callers have been confirmed migrated.

## Principle
Business authorization must be enforced server-side. UI entitlement gates are presentation/UX controls, not security boundaries.
