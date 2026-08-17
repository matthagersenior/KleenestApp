# Kleenest Audit Pass — 2026-08-17 Shell Authority / Navigation / Pricing

## Findings

The repository contained multiple standalone HTML application entrypoints beside `index.html`, including legacy `index2.html` through `index7.html`, `index-fixed.html`, `Index3.html`, `Index4.html`, and `Kleenest_index_pass3.html`. Several older application-shell generations also remained in the tree.

The screenshot behavior was consistent with a legacy/competing application surface rather than the intended single modular entrypoint: the visible navigation included Social/Profile/Business/Admin while the current `index.html` was wired to an older v66 shell.

There was also a concrete dangling dependency in the newer v71 shell: Business referenced a missing `kleenest-business-workspace-v1.js`, and Social referenced a missing `cores/social/social-core.js`. Those were not promoted as the live authority.

## Remediation

- Added `kleenest-app-shell-v72.js` as the single navigation/surface authority.
- Wired `index.html` to v72.
- v72 owns Home, Maps, Social, Profile, Business, and Admin routing.
- Business uses the existing `kleenest-business-workspace.js` rather than the missing adapter target.
- Social uses a self-contained `kleenest-social-runtime-v1.js` rather than the missing v4/v2 dependency chain.
- Maps resolves the canonical Maps mount API and no longer loads the conflicting Maps polish layer from the shell.
- Navigation scroll position is explicitly captured/restored across tab renders so horizontally scrolled navigation no longer snaps to the left edge after selection.
- Removed the legacy standalone HTML entrypoints so they cannot be selected as alternate Pages surfaces.

## Pricing source of truth

Created/updated `pricing_family_catalog_v1` in Supabase Production with seven authoritative plans:

- Free — $0
- Premium — $5/month
- Family Premium — $20/month, owner + up to 4 additional people
- Business Standard — $20/month or $200/year
- Business Growth — $50/month or $500/year
- Business Fleet — $100/month or $1,000/year, up to 100 users
- Business Enterprise — tailored to business size; enterprise fleets are >100 users

Legacy `pricing_plans` and `subscription_plans` records were reconciled to the new business/family pricing where those schemas are used by existing code.

## Verification principle

Continue using: **inspect → reconcile → migrate → verify**.

Do not reintroduce a second application entrypoint or a second navigation owner. Feature modules may exist, but they must render inside the authoritative shell and must not replace the shell's routing/navigation authority.
