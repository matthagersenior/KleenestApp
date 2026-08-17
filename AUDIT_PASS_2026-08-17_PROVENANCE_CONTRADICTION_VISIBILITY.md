# Provenance Contradiction Visibility — 2026-08-17

## Finding
The canonical location confidence function tracked positive and negative bathroom verification counts, but amenity observations (`present` / `absent`) were not surfaced as an explicit contradiction signal. The feature-summary function also counted observations without exposing whether current evidence disagreed.

## Decision
Do not invent a new scoring policy or silently penalize confidence. Preserve the existing score weights and thresholds.

A contradiction is now explicitly observable when, for the same location and amenity, both `present` and `absent` observations exist within the existing 180-day evidence window.

## Implementation
`public.kleenest_location_confidence(uuid)` now exposes:
- `contradictory_amenity_count`
- `contradiction_window`
- `contradiction_policy`

The contradiction signal is informational and does not alter the established confidence score in this pass.

## Verification
- Production schema inspected before change.
- `location_amenity_observations` supports `present`, `absent`, and `unknown` states.
- Production currently contains zero amenity observations, so no existing production records were reclassified or altered.
- Production `location_confidence` currently contains no contradictory rows.
- Migration applied successfully.
- Identical migration committed to `refactor/monolith-removal`.

## Remaining work
Trace consumers of `kleenest_location_confidence` and `location_feature_summary` and verify that UI/API surfaces display contradiction state rather than presenting a single derived value as ground truth. Do not change confidence weights until product semantics are explicitly established.
