# Audit Pass — Business Surface Deduplication

Date: 2026-08-17
Branch: refactor/monolith-removal

## Finding

The active Business tab was rendering multiple overlapping presentation authorities on the same page:

1. Canonical Business Workspace (`kleenest-business-workspace-v1.js`)
2. Business Control Center (`kleenest-business-control-center-v5.js`)
3. Business Gap Closer / Studio index (`kleenest-business-gap-closer-v2.js`)
4. QR Studio hardener/enhancement layer

The observed result was a Business page containing Business Control Center, Business Tools, Business Studio, Workspace, and QR Studio representations of substantially overlapping capabilities.

## Authority decision

The canonical Business Workspace is now the single visible Business surface. It remains responsible for:

- business context and membership
- location portfolio and CRUD
- dataset selection and analytics
- engagement/verification/growth datasets
- promotions, campaigns, partnerships, rewards, events, occupancy, ROI, benchmarks, contests, reviews, photos
- QR/check-in dataset and existing QR workspace

Pricing/entitlement enforcement remains in the Business Core and was intentionally preserved.

## Removed from active mount path

The Business Core no longer mounts:

- Business Control Center enhancement
- Business Gap Closer / Studio feature index
- QR Studio hardener enhancement

These were presentation/enhancement layers that duplicated the canonical workspace surface. No backend authority, RPC, CRUD contract, or database schema was removed.

## Verification

Business Core was updated to v10.5 and the Tab Core Registry was bumped to v5 with a cache-busted Business Core import (`tabcore=23`).

The previous Business Core loaded the workspace and then layered the Control Center, Gap Closer, QR hardener, and entitlement guards. The new Business Core loads the Workspace once and applies only the entitlement guards.

## Expected result

Business should render one coherent workspace rather than stacked dashboards. The user should no longer see duplicated Business Control Center / Business Studio / QR Studio navigation surrounding the canonical workspace.

## Follow-up

Do not delete the legacy presentation files yet. They remain repository artifacts until a consumer scan proves there are no other active callers. The next authority pass should enumerate those callers before deletion.
