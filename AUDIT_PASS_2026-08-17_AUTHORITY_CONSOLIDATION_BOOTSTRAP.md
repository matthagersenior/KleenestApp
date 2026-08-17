# Authority Consolidation — Bootstrap Pass

Date: 2026-08-17
Branch: `refactor/monolith-removal`

## Found

The authoritative `index.html` bootstrap loaded two tab registry generations in sequence. `core/kleenest-tab-core-registry-v1.js` registered the canonical tab cores, then `core/kleenest-tab-core-registry-v2.js` replaced the global registry with a newer implementation. The active shell also identifies itself internally as v15 while retaining the established v13 compatibility export.

Business Core v8 also loaded the v2 entitlement enforcer even though v3 is the canonical implementation and v2 only delegates to v3.

Fleet was eagerly loaded by the bootstrap despite being a Business capability. The canonical Business Core already lazy-loads its Business workspace, so Fleet does not need to be a bootstrap dependency.

## Fixes applied

- Promoted the v4 tab-core specification into the existing `core/kleenest-tab-core-registry-v1.js` canonical owner.
- Removed the superseded registry implementation that replaced the canonical global.
- Restored the old registry path only as an explicit compatibility facade that aliases the canonical v1 registry and cannot replace it.
- Changed Business Core to load and invoke the canonical v3 entitlement enforcer directly.
- Preserved the existing entitlement v1/v2 files as compatibility/reference artifacts rather than deleting them without complete consumer indexing.

## Verification

The canonical registry now owns the six tabs and uses the current canonical core implementations, including Maps v2 and Business v8. The Business Core's entitlement dependency now points directly to v3.

The bootstrap source still requires a final cleanup to remove obsolete script tags and make Fleet fully lazy; that change was intentionally not claimed here after the bootstrap replacement tool rejected the safe full-file update. The active tree was restored to the pre-bootstrap-edit state so no styling or startup behavior was accidentally lost.

## Next action

Perform the bootstrap script-list cleanup as a separately verified change, then build the database/RPC security matrix before touching pricing authority.
