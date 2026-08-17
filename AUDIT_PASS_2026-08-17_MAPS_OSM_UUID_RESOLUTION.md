# Audit Pass — Maps OSM UUID Resolution — 2026-08-17

## Finding

The Maps UI uses synthetic OSM IDs such as `osm:node:<id>`, while trusted bathroom verification requires a real `locations.id` UUID. Passing the external identifier directly would violate the live database contract.

## Live contract

`external_location_records` contains `external_id` and `location_id`, and currently permits public SELECT for external-record resolution.

The live authorities are `ingest_osm_locations(jsonb)` for server-side OSM persistence and `record_bathroom_verification(uuid, boolean, double precision, double precision, double precision)` for trusted verification. Both are SECURITY DEFINER.

## Runtime wiring

The active discovery module now exposes `promoteExternal(row)`. For an OSM result it:

1. sends the row through the existing authenticated `maps-ingest` gateway;
2. resolves `external_location_records.external_id` to `location_id`;
3. retries briefly for persistence visibility;
4. returns the real Kleenest UUID.

The active verification UI then passes that UUID to the existing trusted verification action. No new promotion RPC was invented.

## Current data state

`external_location_records` currently contains zero records. This is expected after removal of the six obsolete demo records and before a live Maps session repopulates OSM records. No fake record was inserted to manufacture an end-to-end result.

## Verification limitation

Source wiring and the live database contract are verified. Browser-level execution is still required to prove Overpass discovery → authenticated maps-ingest → external record → UUID → trusted verification in one session.

No placeholder data was created.
