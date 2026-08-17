# Audit Pass — P0 Canonical Feature Parity Batch 2

Branch: `refactor/monolith-removal`
Reference-only branch: `main` (not modified)

## Findings

The repository contains multiple historical application generations. Older standalone pages contain useful functionality, but allowing them to remain routable creates conflicting UI and data surfaces. The correct treatment is to preserve their feature knowledge while routing all users through one canonical surface implementation.

## Runtime consolidation

- Promoted `kleenest-app-shell-v69.js` to the sole application router.
- Desktop navigation is header-only.
- Mobile navigation is footer-only.
- Authentication changes rebuild the current canonical surface once and fall back to Home if the newly authenticated/unauthenticated user is not entitled to that surface.
- Surface registry is explicit: Home, Maps, Community, Profile, Business, Admin.
- Unknown or unauthorized surface navigation is ignored rather than mounting a legacy page.

## Maps stabilization

- Canonical Maps renderer is loaded before the optional preloader.
- Maps no longer waits indefinitely for the preloader before attempting to mount.
- Preloader becomes an enhancement/data-warm step after the canonical Maps UI is mounted.
- Existing V8/V9/V7 mount aliases are tolerated during consolidation so the renderer can be migrated without a blank Maps surface.

## Feature-parity policy

Historical pages are not treated as active product surfaces. Their features must be inventoried and migrated into the canonical Home/Maps/Profile/Business/Admin/Community surfaces before any historical implementation is deleted.

## Verification required after deployment

1. Fresh browser load.
2. Mobile viewport: verify footer navigation only.
3. Desktop viewport: verify header navigation only.
4. Anonymous: Home → Maps → Community → Profile.
5. Sign in: repeat all four surfaces.
6. Business membership: verify Business appears and uses canonical Business Workspace.
7. Admin membership: verify Admin appears and uses canonical Admin Control Center.
8. Sign out while on Business/Admin: verify immediate return to an allowed surface.
9. Maps: renderer appears even if preloader/data source is delayed or unavailable.
10. Repeat sign-in/sign-out cycle at least three times.

## Commits

- `4ab024255576804bde73f56aee85d2b417b861ff` — add v69 canonical surface shell
- `3e8c1aa4d5470ca2b5fb23092940cf9f9c6da0fd` — make v69 authoritative in index

No changes were made to `main`.
