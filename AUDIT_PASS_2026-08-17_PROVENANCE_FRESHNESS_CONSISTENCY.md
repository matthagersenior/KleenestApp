# Provenance Freshness / Consistency Audit — 2026-08-17

## Scope
Verified source, observation, verification, freshness and confidence authority in production Supabase before changing semantics.

## Findings
1. `record_bathroom_verification` had two overloads. The four-argument legacy overload had no authenticated EXECUTE grant, but remained an unnecessary competing database implementation.
2. `kleenest_location_confidence` used `locations.updated_at` for its freshness bonus. That timestamp can change for unrelated location edits and therefore was not a defensible evidence-freshness signal.
3. Existing confidence inputs already distinguish positive/negative bathroom verification, source count, reviews and verification timestamps. No arbitrary new confidence weights were introduced.

## Fixes applied
- Removed the unused four-argument bathroom verification overload.
- Preserved the five-argument GPS/distance-aware verification contract as the sole client-callable bathroom verification authority.
- Changed confidence freshness to use the latest timestamp from location sources, external observations, or bathroom verification evidence.
- Exposed `evidence_fresh_at` and an explicit `freshness_basis` in the returned factors metadata.
- Preserved the existing confidence score weights and thresholds; only the freshness input was corrected.

## Production verification
- Confirmed the five-argument verification RPC remains executable by authenticated users.
- Confirmed the removed four-argument overload no longer exists.
- Confirmed the confidence function remains an invoker/stable read function.
- Confirmed no new table, RPC authority, or client runtime was introduced.

## Remaining provenance work
Contradiction handling remains the next semantic audit target. Specifically inspect whether positive and negative observations from different sources are surfaced distinctly and whether derived summaries can hide disagreement. No contradiction score or policy was invented in this pass because the existing product semantics must be preserved until the actual consumers are traced.
