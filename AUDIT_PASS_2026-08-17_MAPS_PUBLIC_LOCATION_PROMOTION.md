# Audit Pass — Maps Public Location Promotion — 2026-08-17

## Problem

Public OSM locations are represented in the Maps discovery layer with synthetic identifiers such as `osm:node:<id>`. The trusted bathroom verification RPC requires a real `locations.id` UUID. Therefore an OSM result could be displayed but could not legitimately enter the trusted verification workflow.

## Verified authorities

- OSM discovery creates external source records with `source='osm'` and `source_id` values derived from the OSM element.
- Persistence is already server-authoritative through the `maps-ingest` Edge Function.
- `record_bathroom_verification(uuid, boolean, lat, lng, distance)` is the existing authenticated, SECURITY DEFINER verification authority.
- No separate client-side provenance mutation authority was introduced.

## Implemented path

For an OSM result selected in Maps:

1. User chooses Verify.
2. UI collects an explicit yes/no bathroom answer.
3. Verification module confirms authentication and valid OSM source metadata.
4. The existing `maps-ingest` server authority is invoked for a tight bounding box around the OSM location.
5. The persisted location is looked up by its authoritative `source_external_id`.
6. The resulting real Kleenest `locations.id` UUID is passed to `record_bathroom_verification`.
7. GPS and the existing server-side verification/geofence rules remain authoritative.
8. Maps refreshes so the promoted UUID-backed location becomes the active consumer record.

## Safety properties

- No synthetic `osm:*` identifier is passed to the verification RPC.
- No direct client insert/update is performed against `locations`.
- No direct client mutation is performed against provenance tables.
- No confidence weights are changed.
- OSM source provenance remains intact after promotion.
- Existing UUID-backed locations continue through the original verification path.

## Not claimed

Browser-level execution against the deployed Pages bundle remains required before declaring the complete end-to-end promotion flow verified. The source-level authority chain is now complete and explicitly wired.