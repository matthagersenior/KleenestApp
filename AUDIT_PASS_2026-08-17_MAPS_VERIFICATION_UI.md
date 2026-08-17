# Audit Pass — Maps Verification UI — 2026-08-17

## Defect

The active Maps detail surface exposed a `Verify` button, but its direct handler invoked the trusted verification authority with an empty evidence object. The live authority correctly requires an explicit boolean bathroom answer, so the rendered action could never successfully complete a verification from the UI.

## Fix

Added `cores/maps/maps-verification-ui.js` and wired it into the canonical `maps-tab-core-v2.js` lifecycle.

The active rendered Verify action now:

1. intercepts the detail Verify interaction before the old empty-evidence handler;
2. asks the user an explicit Yes/No question;
3. passes the resulting boolean as `hasPublicBathroom`;
4. reopens the canonical detail action through `maps-details`;
5. invokes the existing trusted `record_bathroom_verification` authority;
6. reports success/failure in the existing detail status area.

The existing server-side GPS/geofence/eligibility authority remains unchanged.

## Safety

- No confidence weights changed.
- No client-side verification mutation authority added.
- No fake verification state is written locally.
- No demo data restored.
- `/main` is not part of the product branch.

## Verification boundary

Repository wiring was re-read after the change. Browser-level interaction against the deployed Pages bundle remains the final runtime gate.