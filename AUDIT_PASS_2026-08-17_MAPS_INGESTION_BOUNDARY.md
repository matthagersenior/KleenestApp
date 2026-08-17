# Maps ingestion boundary audit — 2026-08-17

Branch: `refactor/monolith-removal`

## Findings

- The canonical Maps discovery path already has a direct Overpass fallback/enrichment path.
- The branch contains no `supabase/functions/` tree and no `ingest-map-candidates` Edge Function source.
- Supabase contains the canonical location/source/job tables, but no public SQL routine named `ingest-map-candidates` or equivalent.
- The client therefore had a source-level dependency on an ingestion function that is not represented by the authoritative branch.

## Changes

- Removed the `supabase.functions.invoke('ingest-map-candidates', ...)` call from canonical Maps Discovery.
- Maps now proceeds directly from a sparse canonical RPC result to live OSM/Overpass enrichment.
- Hardened `mergeUnique()` so external source identity (`source` + `source_id` / `source_external_id`) is considered before coordinate/name fallback. This prevents an ingested OSM record and its live Overpass representation from becoming duplicate map entries.

## Database/RLS

No database schema, function, or RLS changes were made in this pass.

Verified current RLS classification:

- `locations`: RLS enabled; public verified-active select plus authenticated business-member management.
- `location_sources`: RLS enabled; public read.
- `location_ingestion_jobs`: RLS enabled; admin read.

## Verification

The active Maps Discovery source no longer references `ingest-map-candidates` and retains the direct Overpass fallback. The branch remains the source of truth; `main` was not used.

Code commit: `7be70eb521013556f9783925d823d6edbedcd158`
