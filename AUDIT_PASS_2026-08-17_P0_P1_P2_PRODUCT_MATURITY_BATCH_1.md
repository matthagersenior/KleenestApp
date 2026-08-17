# P0/P1/P2 Product Maturity Batch 1

Branch: `refactor/monolith-removal` only. `main` is reference-only and is not an implementation source.

## P0 closed in this batch

- Canonical product shell promoted to v67 on the working branch.
- Consumer Home now leads with the core mission: find a restroom you can trust.
- Primary surfaces are explicit: Home, Maps, Community, Profile, Business and Admin.
- Mobile navigation is part of the authoritative shell rather than a separate competing router.
- Every surface has loading, failure and retry behavior.
- Maps loader accepts the actual canonical Maps V8/V7 surface rather than assuming V9.
- Business opens through the existing canonical Business Workspace adapter instead of a shell-only placeholder dashboard.
- Community is mounted from the canonical Social Core.
- Location trust presentation is connected to the authoritative Supabase confidence function.
- Supabase business/private lookup functions no longer execute anonymously where anonymous access was not appropriate.
- Progression metric recording now supports idempotency keys and caps event quantity at 100 to reduce accidental/replayed reward inflation.
- Location provenance, ingestion jobs and confidence authority now have first-class database structures.

## P1 implemented in this batch

- Kleenest location confidence model.
- Location health view.
- Location-source provenance model.
- Public-data ingestion job contract.
- QR attribution event model and validated QR attribution RPC.
- Admin data-integrity summary RPC covering orphaned business members, business locations, QR locations, enterprise network relationships and notifications.
- Notification center is reachable through Social Core's Notifications surface.
- Accessibility/location intelligence presentation layer is now wired to Maps result rendering.
- Progression abuse protection foundation via idempotency and quantity limits.

## P2 foundations present

- Social Core is authoritative in the shell.
- Existing games/challenges/leaderboards remain reachable through the community/progression product spine.
- Enterprise partner-network backend domains remain represented by the Business/Enterprise backend surface rather than invented duplicate APIs.
- Location intelligence now has a canonical extension point for future enterprise location-intelligence products.

## Verification

- Production Supabase was inspected directly.
- `list_program_locations(uuid)`, `list_my_demo_programs()` and `list_my_partner_memberships()` now report anonymous execution disabled and authenticated execution enabled.
- `record_progression_metric_event(...)` reports anonymous execution disabled and authenticated execution enabled.
- `admin_data_integrity_summary()` is admin-only at the RPC privilege layer.
- `kleenest_location_confidence(uuid)` returns live scores; sample production records returned Trusted/High confidence results from real verification/review data.
- `record_qr_attribution(...)` is intentionally callable anonymously for scan attribution, but validates an active QR code before recording an event.
- GitHub Pages source remains `refactor/monolith-removal`; the current deployment build is tied to the working branch, not `main`.

## Not falsely marked complete

The remaining P1/P2 items that require deeper feature-specific implementation are still open: full Clean Route UX, complete QR attribution analytics dashboards, business recommendation ranking, full accessibility intelligence across all location attributes, structured Admin editors for every domain, notification actions/preferences, richer profile/history presentation, partner marketplace UX, enterprise API productization, fleet intelligence and additional location-intelligence products.

These should be implemented in subsequent large batches against this same branch rather than represented by static placeholders.
