# Audit Pass — Maps Ingestion Authority Runtime — 2026-08-17

## Finding

The live `ingest_osm_locations(jsonb)` RPC is `SECURITY DEFINER` and explicitly requires `auth.role() = 'service_role'`.

The Maps Edge Function must therefore authenticate the calling user and then invoke the RPC with the server service-role client. The browser must never receive or use the service-role key.

## Runtime correction

The live `maps-ingest` Edge Function was upgraded from version 5 to version 6.

Version 6 now requires an Authorization header, validates the bearer token with Supabase Auth using the anon client, rejects invalid authorization, and invokes the protected ingestion RPC with the server-only `SUPABASE_SERVICE_ROLE_KEY`. JWT verification remains enabled at the Edge Function gateway.

No client-side service-role credential was introduced.

## Live verification

Production `maps-ingest` is ACTIVE at version 6 with JWT verification enabled.

The live `ingest_osm_locations` function remains SECURITY DEFINER and continues to reject non-service-role execution.

## Remaining boundary

The active Maps discovery source still exposes synthetic `osm:*` IDs for immediate rendering. A verified promotion path must resolve the persisted `external_location_records.location_id` before invoking trusted bathroom verification. That consumer wiring is not declared complete until the repository write can be applied and re-read successfully.

No guessed promotion RPC was created.
