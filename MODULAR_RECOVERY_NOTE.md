# Modular Recovery Note

## Mission / purpose
The large 5,000+ line `index.html` is the **monolith reference/demo/test/upgrade source**. It is NOT the modular production runtime. The purpose of this work is to migrate its useful features into maintainable modular files and expose those modules through one authoritative shell on `refactor/monolith-removal`.

When told to "look for the note", read this file first and continue from the checkpoint below. Do not restart the investigation and do not replace the modular runtime with the monolith.

## Current authoritative runtime
- Target branch: `refactor/monolith-removal`
- Latest shell commit: `0687319d39fb1973d74a3255b3ab5c314a411383`
- Latest index commit: `202bd57b06e992371ef50a7a1bce5f8b7e2b9c3b` (modular index cache versions r9/modular8)
- Registry remains the authoritative lazy module map; it must point only to files that actually exist on this branch.

## Latest pass — authentication, persistence, account-level surface gating
The previous implementation authenticated successfully but failed to restore identity after refresh because the shell called `KleenestSupabase.session()` before guaranteeing that the Supabase JS CDN client existed. The shell now loads the Supabase client before every identity hydration, including startup/refresh, then hydrates profile, business memberships, and subscription summary.

The shell now:
1. Restores the persisted Supabase session on every startup.
2. Loads the user's profile and business memberships.
3. Loads `user_subscription_summary` when available and derives `accountLevel` from profile/subscription fields.
4. Hides all Sign In / Sign Up controls once a session exists and replaces the Home account card with Welcome Back/Profile access.
5. Shows Business only for a business membership/business account or business-level account.
6. Shows Admin only for `is_admin` or owner/admin membership.
7. Rebinds the shell after Supabase auth state changes so login/logout immediately changes visible tabs.
8. Prevents direct navigation into Business/Admin when the account does not have access.
9. Keeps authentication and account hydration inside the modular shell; the monolith and legacy auth launcher are not runtime dependencies.

## Modular surfaces to keep attaching
- Maps: location + map category filters + maps compatibility
- Social/Games: `kleenest-social-game-surface.js`, then progressively reconnect historical `kleenest-engagement.js` dependencies
- Business: `kleenest-business-workspace.js`, business data/state, analytics, QR, actions, management
- Admin: `kleenest-business-admin-complete.js`, business data/state, analytics, QR
- Profile/account: account/account-state modules

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

## Next work — continue as many tasks per pass as possible
1. Verify the persisted-session path and account-level tab gating against the real account.
2. Verify Business/Admin actually mount their existing rich surfaces, not placeholders, after identity hydration.
3. Verify Social/Game surface and reconnect historical engagement services without breaking fallback.
4. Reconnect QR Studio + advanced CRUD with Growth+/owner/admin gating.
5. Reconnect Photos/Media/VR, Partnerships, Campaigns, Promos/Offers, Events and Reviews/Replies.
6. Keep all datasets calculation-specific and location-specific; never show a generic value for a selected dataset.
7. Compare the monolith as reference only and migrate missing capabilities into modular files rather than importing its renderer.
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
