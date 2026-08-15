# Modular Recovery Note

## Mission / purpose
The large 5,000+ line `index.html` is the **monolith reference/demo/test/upgrade source**. It is NOT the modular production runtime. The purpose of this work is to migrate its useful features into maintainable modular files and expose those modules through one authoritative shell on `refactor/monolith-removal`.

When told to "look for the note", read this file first and continue from the checkpoint below. Do not restart the investigation and do not replace the modular runtime with the monolith.

## Current authoritative runtime
- Target branch: `refactor/monolith-removal`
- Current index commit: `62d14f064b266bc757678623b01978276c04bab0`
- Current shell commit: `ed245f2306b6a80fb8373e7a4aaf68d5f10c6462`
- Current registry commit: `5f79619e024b54fd2b5c2be38663fd8f82c414fb`
- New modular social/game surface: `kleenest-social-game-surface.js` commit `04f025f1e8e94417c352b78f6b7f8dc65161c2ae`

## What was fixed in the latest pass
1. The modular registry now includes the previously omitted account state, business data, business state, UI integration and a dedicated social/game surface.
2. The shell now hydrates the authenticated Supabase user with the profile and `business_members` membership data before deciding whether Business/Admin tabs should appear.
3. Business access is derived from actual memberships, not from the Supabase auth user alone.
4. Admin access is derived from profile admin flags and owner/admin business membership.
5. Profile now explicitly exposes connected Business and Admin access when present.
6. Business surface now loads `kleenest-business.js` + `kleenest-business-state.js` before the Business workspace, allowing the existing authoritative workspace/analytics layer to obtain real membership/business context.
7. Admin surface now loads the same business data/state prerequisites before `kleenest-business-admin-complete.js`.
8. Social now loads a dedicated modular Social + Game surface rather than leaving an empty placeholder. It exposes Game Center, Clean Quiz, Quick Trivia, Memory Match, Daily Spin, contests and rewards, while remaining usable if older social service dependencies are unavailable.
9. Index cache versions were bumped to registry `r8` and modular entry `modular7`.

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
- `8c775b3` — `kleenest-business.js` secure business data layer
- `ce4895` — reconciled business data/state wiring

## Known architectural facts
- `kleenest-business-workspace.js` is already a rich authoritative Business UI with datasets including Overview, Locations, Engagement, QR & Check-ins, Visitors, Reviews, Photos/Media, Promotions, Campaigns, Partnerships, Rewards, Events, Occupancy, ROI, Growth, Benchmarks and Verification/Tier.
- `kleenest-business-admin-complete.js` already contains business/admin operations including locations, promotions, partner programs, campaigns, QR and media controls.
- `kleenest-business-state.js` loads memberships, business dashboard data, locations, reviews and promotions.
- `kleenest-account-state.js` loads authenticated account state.
- `kleenest-supabase.js` exposes `profile()` and `businessMemberships()`.
- `kleenest-engagement.js` is the historical cross-surface social/game layer, but its dependencies are not all reliably present under their expected names; the dedicated `kleenest-social-game-surface.js` is the resilient modular bridge while those deeper services are migrated.

## Next work — continue as many tasks per pass as possible
1. Verify live Social/Game surface and progressively reconnect the historical `kleenest-engagement.js` services (gamification/social/community/game) without breaking the resilient fallback.
2. Verify Business membership/profile population against the real Supabase account and make the Business workspace show all locations immediately after authentication.
3. Verify Admin access and platform overview for the actual admin account.
4. Reconnect QR Studio + advanced CRUD to the Business workspace and ensure Growth+/owner/admin gating.
5. Reconnect Photos/Media/VR, Partnerships, Campaigns, Promos/Offers, Events and Reviews/Replies.
6. Keep all datasets calculation-specific and location-specific; never show a generic value for a selected dataset.
7. Continue comparing the monolith as a reference only and migrate missing capabilities into modular files rather than importing its renderer.
8. Keep the shell lazy and non-blocking. No monolithic renderer, no polling observers, no recursive startup rendering.

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
