# Modular Recovery Note

## Mission / purpose
The large 5,000+ line `index.html` is the **monolith reference/demo/test/upgrade source**. It is NOT the modular production runtime. The purpose of this work is to migrate useful monolith features into maintainable modular files and expose those modules through one authoritative shell on `refactor/monolith-removal`.

When told to "look for the note", read this file first. Do not restart the investigation and do not replace the modular runtime with the monolith.

## Current checkpoint
- Target branch: `refactor/monolith-removal`.
- Authentication now works through the modular shell; persisted sessions/account hydration and account-level tab gating are part of the shell.
- Registry is the authoritative lazy module map.
- Maps now has an explicit modular surface: `kleenest-maps-surface.js`, registered as `mapsSurface` and attached by the map discovery bootstrap. This surface provides nearby locations, location permission, refresh, category filtering and location cards without importing the monolith.
- Registry cache version is `r10`.
- Social/Games has an explicit modular surface: `kleenest-social-game-surface.js`. It provides overview, games, contests and rewards with resilient fallback; historical `kleenest-engagement.js` remains a deeper service source to reconnect progressively.

## Modular surfaces to keep attaching
- Maps: `kleenest-location.js` + `kleenest-map-discovery-bootstrap.js` + `kleenest-maps-surface.js` + category filters + compatibility.
- Social/Games: `kleenest-social-game-surface.js`, then progressively reconnect historical `kleenest-engagement.js` dependencies.
- Business: `kleenest-business-workspace.js`, business data/state, analytics, QR, actions, management.
- Admin: `kleenest-business-admin-complete.js`, business data/state, analytics, QR.
- Profile/account: account/account-state modules.

## Existing feature sources to keep migrating/reusing
- `f219de80` — advanced QR + business CRUD controls
- `636fe781` — authoritative Business workspace + analytics
- `c6f9a625` — modular Game Center / `kleenest-engagement.js`
- `b3673dc` — Social + Media services
- `cb024e8c` — centralized account/business loading
- `1c70c6c` — navigation controller
- `c12b3aa` — notification UI controller
- `6461875b` — Business renderer
- `9f03f53` — Business action layer
- `ef99c58` — Rewards loading
- `8c775b3` — secure business data layer
- `ce4895` — reconciled business data/state wiring

## Next work — continue as many tasks per pass as possible
1. Verify Maps surface against real location data and connect the richer map renderer/filter modules if present.
2. Verify Business/Admin rich surfaces mount after identity hydration and expose their real datasets/CRUD.
3. Reconnect historical engagement dependencies so Social/Games uses durable services instead of only local fallback state.
4. Reconnect QR Studio + advanced CRUD with Growth+/owner/admin gating.
5. Reconnect Photos/Media/VR, Partnerships, Campaigns, Promos/Offers, Events and Reviews/Replies.
6. Keep all datasets calculation-specific and location-specific; never show generic values for a selected dataset.
7. Compare monolith as reference only and migrate missing capabilities into modular files rather than importing its renderer.
8. Keep startup lazy/non-blocking and avoid polling observers or recursive startup rendering.

## Non-negotiable product rules
- Branding: `Kleenest` only; never `KKleenest` or `Cleanest` in displayed app copy.
- Standard Business: basic overview stats.
- Growth+: advanced analytics, QR Studio, campaigns, promos/offers and advanced business tools.
- Account owner/admin controls customization and CRUD for business-managed resources.
- QR works for every business for check-in/analytics; advanced customization is gated.
- Amenities match premium search filters; rating feedback captures good/needs-attention amenities.
- Occupancy uses fixture counts including stalls, urinals, sinks, etc.
- Photos are size-aware; authorized Growth+/Enterprise businesses can upload photos and VR/360 media.
- Multi-location selection must remain available, including All Locations overview.
- Do not restore the monolithic renderer as the modular runtime.
