# P0 / P1 / P2 Completion Batch 2 — 2026-08-17

## Completed

### P0 — security

- Hardened the previously identified 16 public tables without RLS.
- Added ownership/business-context read policies.
- Removed direct anonymous/authenticated table DML from the audited tables.
- Enabled RLS on the final two remaining public tables (`ad_placements`, `pricing_plans`).
- Result: **0 public base tables without RLS**.
- Reviewed the previously identified PUBLIC-executable SECURITY DEFINER surface.
- Result: **0 SECURITY DEFINER functions in the public schema remain executable by PUBLIC**.
- Preserved anonymous Maps discovery only for the intentional `nearby_locations_enriched` read contract.

### P0 — CI/regression gate

Added `.github/workflows/kleenest-refactor-ci.yml` for the canonical branch.

The gate currently checks:

- JavaScript syntax across the repository;
- production entrypoint contracts;
- canonical surface files;
- the known `qr_codes.business_id` schema regression;
- entitlement alert dead ends;
- Pages branch authority;
- migration timestamp naming/order;
- required security hardening migrations.

### P1 — pricing authority

Established `pricing_authority_v1` as the canonical active pricing read model over `pricing_catalog`.

`pricing_plans` is now explicitly compatibility-only.

The pricing UI must use the canonical read model for current products, prices, intervals and feature descriptions.

The current canonical catalog still intentionally contains both monthly Premium and the one-time `premium_user` product. That is now an explicit product/catalog decision to resolve later rather than an accidental second pricing source.

### P1 — entitlement UX

Added `kleenest-business-feature-entitlement-enforcer-v2.js`.

Locked Business actions now open a real pricing dialog populated from `pricing_authority_v1` instead of stopping at a browser alert.

The dialog highlights the required tier and presents current pricing information.

The old v1 entitlement file is now only a compatibility facade.

### P1/P2 — account plans

Account Plans now reads `pricing_authority_v1` and correctly renders monthly, one-time and contact/inquire pricing instead of assuming every product is monthly.

### P2 — consumer check-in friction

Added `kleenest-home-checkin-bridge-v1.js` and loaded it from the canonical bootstrap.

The existing Home **Check in & verify** CTA is now bound to the real `KleenestQR.scan()` camera flow when QR scanning is available, with the existing scanner's authenticated/geofenced server verification remaining authoritative.

## Not declared complete yet

- Full automated browser/E2E suite.
- Complete Fleet mutation workflows.
- Complete Business CRUD gaps from issue #6.
- Full Admin repair-tool implementation.
- Universal provenance/confidence contract.
- Universal progression event coverage/idempotency proof.
- Final pricing product decision between monthly Premium and one-time Premium User.
- Full legacy-file reachability classification and deletion.
- Full accessibility/performance pass.

Those remain active work rather than being falsely marked complete.

## Live database verification after hardening

- public base tables without RLS: **0**
- SECURITY DEFINER functions executable by PUBLIC: **0**
- intentional anonymous Maps discovery RPC: retained

## Canonical branch

All application changes are on `refactor/monolith-removal`. `/main` is not part of the product workflow.
