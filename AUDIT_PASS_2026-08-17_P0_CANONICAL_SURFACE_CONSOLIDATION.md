# P0 Audit — Canonical Surface Consolidation

## Scope
Working branch: `refactor/monolith-removal` only. `main` is reference-only.

## Finding
The repository contained multiple standalone HTML application entry points in addition to the canonical `index.html`. `Index3.html`, `Index4.html`, and `Kleenest_index_pass3.html` each contained an older, feature-rich application shell with its own desktop/mobile navigation, Maps UI, GPS status, restroom cards, amenities, reviews, fixtures, passes, and other behavior. These were separate application authorities rather than inert documentation.

This explains why users could encounter an older-looking page with different information or navigation behavior depending on the URL/entry point.

## Immediate P0 action
All three legacy HTML entry points were converted to deterministic redirects into the canonical `index.html` application. Their previous implementations remain recoverable through Git history and are now treated as source material for feature-parity migration, not active product surfaces.

Retired entry points:
- `Index3.html`
- `Index4.html`
- `Kleenest_index_pass3.html`

## Canonical authority
`index.html` now loads the v68 shell as the sole application router/navigation authority and intentionally excludes the legacy modular shell and legacy mobile navigation.

## Preservation rule
No feature from the retired implementations is considered discarded merely because the old entry point was retired. Features discovered there must be inventoried and migrated into the appropriate canonical surface before being considered complete.

Known legacy feature areas requiring parity review include:
- Maps/GPS/location status
- restroom search/result cards
- amenities and fixture information
- cleanliness/trust presentation
- reviews
- profile/account behavior
- pass/QR-related behavior
- filters/chips
- mobile and desktop navigation

## Next P0 work
1. Build a feature-parity inventory from the retired implementations.
2. Map each capability to exactly one canonical surface/core.
3. Migrate missing capabilities without restoring duplicate entry points.
4. Remove obsolete renderer aliases after caller inventory confirms no dependency.
5. Run logout/login regression across every surface.
6. Verify Maps after authentication transitions and on mobile.

## Result
The user-facing application now has one intended entry point. Legacy pages can no longer compete with the canonical shell when reached directly.
