# Data / Provenance Authority Audit — 2026-08-17

## Inspection
Inspected the production schema for source, observation, evidence, verification, confidence, freshness, provenance and derived-metric structures.

Confirmed authoritative structures include:
- `location_sources`
- `location_amenity_observations`
- `location_quality_observations`
- `location_bathroom_verifications`
- `external_observations`
- `location_confidence`
- `data_feature_events`

Confirmed existing server-authoritative mutation functions include:
- `submit_amenity_observation(...)`
- `submit_location_quality_observation(...)`
- `record_bathroom_verification(...)`
- `apply_external_amenity_observation()` trigger path

## Verified defect
Public client roles (`anon` and `authenticated`) had direct INSERT/UPDATE/DELETE/TRUNCATE privileges on provenance and observation tables. This allowed callers to bypass the existing validation, attribution, verification and derived-metric paths implemented by the authoritative functions.

The production datasets are currently empty for the inspected observation/provenance tables, so the privilege correction does not rewrite or invalidate existing records.

## Fix applied
Migration `20260817210000_provenance_mutation_authority_hardening.sql` was applied to production.

Removed direct mutation privileges for `anon` and `authenticated` on:
- `external_observations`
- `location_sources`
- `location_amenity_observations`
- `location_quality_observations`
- `location_bathroom_verifications`
- `data_feature_events`
- `location_confidence`

Read access was not changed by this migration.

## Verification
A post-migration privilege query returned zero public-role INSERT/UPDATE/DELETE/TRUNCATE grants across all seven protected provenance/derived tables.

No new observation service, placeholder table, competing RPC, or duplicate provenance layer was created.

## Remaining P1/P2 investigation
- Trace all active repository consumers of observation/verification functions and confirm they use the authoritative RPCs.
- Audit RLS policies on provenance tables for read isolation.
- Review `kleenest_location_confidence` scoring inputs and freshness/contradiction semantics before changing the scoring formula.
- Inspect external ingestion authorization and provenance payload requirements before adding constraints; current external-observation tables contain no production rows.
