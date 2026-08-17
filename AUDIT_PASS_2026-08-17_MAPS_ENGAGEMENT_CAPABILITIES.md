# Audit Pass — Maps Engagement Capabilities — 2026-08-17

## Result

The canonical Maps Details consumer now exposes explicit action capabilities alongside the existing server-authoritative action functions.

UUID-backed Kleenest locations expose:
- check-in
- favorite
- verification
- route
- share

Synthetic `osm:*` public-data locations expose only share. Mutation/route actions return a non-authoritative unavailable result and cannot pass the synthetic identifier to engagement or route RPCs.

## Important safety property

Capability detection is based on the identifier contract itself: only a valid UUID is eligible for Kleenest mutation actions. Public-data rows remain non-mutable until promoted through the established ingestion/promotion path.

## No database change

No RLS policy was broadened and no new mutation RPC was created. Existing server authorities remain the source of truth.

## Commit

`7e4d2a72b5c54071819273704dbf2c21ed3d6ce8`

## Verification limitation

Browser execution against the deployed Pages bundle remains the final runtime gate.
