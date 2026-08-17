# Audit Pass — QR Business Scope & Lifecycle — 2026-08-17

## Scope
Harden the canonical Business QR surface so QR records have an authoritative business owner, support business-wide or location-specific scope, and expose complete create/update/activate/deactivate/delete lifecycle operations.

## Findings
- `qr_codes` originally had only `location_id`; `business_id` did not exist.
- `location_id` was NOT NULL, so a genuinely business-wide QR could not be represented.
- Existing Business QR UI attempted business-wide creation by passing a null location, but the backend rejected it.
- The existing Business Gap Closer QR toggle path called `business_update_custom_qr` without the required update payload.
- QR management functions were already protected from PUBLIC/anon execution, but their ownership checks were location-derived and therefore incomplete for a business-wide scope.

## Changes
- Added `qr_codes.business_id` and backfilled it from canonical locations.
- Made `qr_codes.location_id` nullable while retaining business ownership as mandatory.
- Added business and business/location indexes.
- Replaced the QR RLS policy with business-scoped ownership and advanced-tier enforcement.
- Hardened `business_create_custom_qr` to accept either a valid business-wide scope (`p_location_id IS NULL`) or a location belonging to the business.
- Hardened `business_update_custom_qr`, `business_delete_qr`, `business_set_qr_active`, and the JSON QR management overload around `business_id` ownership.
- Added `kleenest-business-qr-studio-hardener-v1.js` with business-wide/location scope selection, create, edit, preview, PNG export, copy, activate/deactivate, and delete.
- Mounted the hardener from canonical Business Core v10.4 after the existing feature gap layer.
- Expanded active CI to check the new QR scope/lifecycle contracts.

## Live verification
- `qr_codes.business_id` exists and is NOT NULL.
- `qr_codes.location_id` is nullable.
- RLS remains enabled on `qr_codes`.
- QR mutation functions have `PUBLIC EXECUTE = false` and `anon EXECUTE = false`.
- Authenticated execution remains available to reach the protected authorization logic.
- `business_manage_qr` overloads remain non-public.

## Verification boundary
A real create/update/delete test using a business user's authenticated session is intentionally not fabricated. The database definitions, authorization grants, RLS policy and client contract are verified; live user-session mutation testing should be performed through the authenticated browser flow.
