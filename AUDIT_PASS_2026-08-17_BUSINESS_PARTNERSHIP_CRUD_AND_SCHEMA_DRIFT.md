# Audit Pass — Business Partnership CRUD + Live Schema Drift — 2026-08-17

**Authoritative branch:** `refactor/monolith-removal`

## Scope

Continue P1 Business workspace work from GitHub issue #6 without inventing a consumer path. Trace the active Business workspace, its partnership/QR mutation calls, and the live Supabase contract.

## Verified findings

- Active Business Core is `cores/business/business-core-v8.js`.
- Active Business workspace is `kleenest-business-workspace-v1.js`.
- The workspace already had location selection, dataset selection, and CRUD rendering for Partnerships and QR.
- Partnership edit was defective: the UI always called `business_create_partner_program`, so an Edit action created a second program instead of updating the selected record.
- Partnership Delete was also nonfunctional because the workspace had no delete RPC mapping for the dataset.
- Live Supabase contained only the existing authorized partnership create RPC; no update/delete authority existed.
- The live `partner_programs` table is keyed by `id`, scoped by `business_id`, and has `name` and `enabled` fields suitable for a minimal authoritative update/deactivation lifecycle.
- Existing partnership creation requires `business_can_manage(p_business_id)` and Business Enterprise tier. The new update/delete RPCs preserve those same authorization/tier boundaries.
- New partnership update/delete RPCs are `SECURITY DEFINER`, revoke PUBLIC/anon EXECUTE, and grant only authenticated EXECUTE.

## QR finding

The active workspace had a `business_delete_qr` call, but the live database does not expose that RPC. The existing canonical QR mutation authority is `business_update_custom_qr`, which supports `p_active=false` and is scoped by `business_id` plus Business Growth/Enterprise authorization.

The workspace was corrected to interpret the existing QR lifecycle as **Deactivate**, not a nonexistent hard-delete operation. It sends the selected QR's existing canonical fields back through `business_update_custom_qr` with `p_active=false`.

This avoids creating a competing QR deletion implementation and preserves the existing QR lifecycle authority.

## Live schema drift discovered

The repository's earlier QR audit documentation stated that `qr_codes` did not contain `business_id`. The live production schema now **does** contain `qr_codes.business_id`.

The Supabase migration history also contains multiple migrations that are present in the live database but are not present in the GitHub branch migration directory, including:

- `qr_business_scope_v1`
- `qr_single_use_lifecycle_and_scoped_analytics`
- multiple provenance hardening migrations
- Fleet hardening migrations
- the newly executed RLS and partnership migrations from this pass

This is now classified as **migration/source drift**, not as a reason to guess at the historical migration source. The live schema is authoritative for current runtime verification, while the repository remains authoritative for code changes. Missing historical migration files must be reconstructed/committed only from verified database contracts, not fabricated from names.

## Security correction

Live verification found the 16 tables previously identified as lacking RLS were actually still reporting `relrowsecurity=false`, despite the repository containing the intended hardening migration. RLS was enabled on all 16 in the live database and verified afterward as `relrowsecurity=true`.

The corresponding live migration was recorded in GitHub as:

`supabase/migrations/20260817190932_p0_enable_rls_on_unprotected_public_tables.sql`

## Implemented changes

1. Added live-authoritative partnership update RPC.
2. Added live-authoritative partnership delete RPC.
3. Added the exact migration source files for both newly executed migrations to the authoritative branch.
4. Fixed Business Partnership Edit to call update for an existing record.
5. Fixed Partnership Delete to call the new authorized delete RPC.
6. Added an Enabled/Disabled field to the Partnership editor.
7. Changed QR Delete UI semantics to Deactivate and routed it through the existing authorized QR update RPC.

## Verification

- Live partnership RPC signatures verified.
- Live partnership RPC grants verified: PUBLIC=false, anon=false, authenticated=true.
- Existing partnership create authorization verified: Business management + Enterprise tier.
- Existing QR update authorization verified: Business management + Growth/Enterprise tier.
- Active Business workspace source re-fetched after modification and verified to contain the new partnership update/delete wiring and QR deactivation path.
- Live RLS state for all 16 previously unprotected public tables verified true.

## Not declared complete

- Full Business issue #6 closure is not claimed.
- Analytics semantic separation still needs deeper dataset-by-dataset verification.
- Full browser interaction verification is still required.
- Historical live-only Supabase migrations remain a source-drift recovery task.
- QR schema history must be reconciled with the older audit note before changing any QR schema assumptions.

## Branch

All changes remain on `refactor/monolith-removal`. `/main` is excluded from the product workflow.
