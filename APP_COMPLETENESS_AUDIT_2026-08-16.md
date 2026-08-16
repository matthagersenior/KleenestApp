# Kleenest Full Application Audit

Branch: `refactor/monolith-removal`

Audit mode: **full wiring / no placeholders / cross-reference first**.

## Audit contract

Every user-visible surface must have:

1. real initialization;
2. real UI action handling;
3. real core/backend wiring;
4. server-authoritative authentication/authorization;
5. account and business-tier enforcement;
6. complete loading/empty/error/success states;
7. shared progression integration where applicable;
8. cross-core interoperability;
9. a consistent Kleenest visual system;
10. no dead, fake, placeholder, or decorative controls presented as functional.

## Canonical modular architecture

The active modular shell is `kleenest-modular-shell-v1.js` and the production entry point is `index.html` on this branch. The shell exposes Home, Maps, Social, Profile, Business and Admin. Maps, Social, Media, Progression and Business value functionality are separated into cores. fileciteturn41file0L2-L6

The branch is materially behind `main` and must be treated as the working product branch rather than copying `main` wholesale. The branch currently contains a modular shell and dedicated core directories for Business, Maps, Media, Progression and Social. fileciteturn38file0L2-L2 fileciteturn42file0L2-L10

## Full backend capability inventory discovered

The production Supabase project contains substantially more capability than the current Admin UI exposes. The public function inventory includes:

### User/community
- profiles and account capabilities
- followers
- social posts/comments/reactions/saves
- notifications
- support/feedback
- account deletion requests
- leaderboards

### Maps/locations
- nearby location search
- location identity resolution
- location detail
- location visits
- map views/check-ins
- favorites
- bathroom verification
- amenities
- occupancy
- location QR
- preferred-location activation/usage
- OSM enrichment
- route creation/completion

### Reviews
- review creation
- review replies
- review likes
- amenity feedback
- review reward summaries
- rating refresh

### Progression/gamification
- progression actions
- progression metric events
- gamification activity
- badge evaluation
- user rewards history
- progression summary
- challenges/games/leaderboards through the modular product layer

### Business
- business/location CRUD
- business members and roles
- events
- campaigns
- contests
- promotions
- QR creation/customization/status/analytics
- media
- partnerships
- partner programs
- preferred access
- rewards
- visitors
- reviews
- occupancy
- growth/ROI/benchmark analytics
- engagement attribution

### Enterprise/partner network
- enterprise networks
- network membership
- campaigns
- allocations
- campaign outcomes
- network metrics
- ROI
- benchmarks
- invitations and activation/status management

### Commerce/subscription
- subscription summary
- premium entitlement
- single-use access offers
- purchases/redemptions
- business tiers

### Administration
- protected Admin CRUD gateway
- Admin overview
- pending businesses
- reports
- account capability management
- business tier management
- business verification management

## Critical cross-reference findings

### Finding A — Admin visibility is incomplete

The current Platform Admin Core v2 only exposes a small CRUD resource map: profiles, businesses, locations, business campaigns/events, contests, partner programs, promotions, reviews, social posts, badges, reports and support requests. Its Data & CRUD UI is therefore **not a complete control-center representation of the backend domain model**. fileciteturn46file0L2-L6

Important backend domains currently missing from that Admin resource map include, at minimum:

- location visits
- bathroom verification records
- QR codes/scans
- favorites
- follows
- comments/reactions/saves
- contest entries
- progression metric events
- gamification activity
- challenges/game state
- rewards/history
- notifications
- account deletion requests
- user feedback
- subscriptions
- single-use access offers/purchases
- business members
- business media
- partner agreements
- enterprise partner networks
- enterprise partner memberships
- enterprise campaigns
- enterprise allocations
- enterprise campaign outcomes
- enterprise network metrics
- engagement attribution
- preferred-location activations/usages
- location amenities
- occupancy-related data
- analytics datasets

These are not automatically candidates for unrestricted CRUD. Each must be classified as **CRUD, controlled mutation, operational action, analytics/read-only, or internal/derived** before exposure.

### Finding B — Business backend is richer than the visible workspace contract

The database has authoritative business-management functions for locations, events, campaigns, contests, promotions, QR, media, partnerships, members, preferred access and numerous analytics datasets. This means the Business workspace should be audited against the function inventory rather than assuming the visible menu is complete.

The modular shell currently loads the Business Value Core and then opens the canonical Business Workspace adapter when available. fileciteturn41file0L2-L6

### Finding C — duplicate/legacy script loading needs cleanup

`index.html` currently loads both v1 and v2 Admin cores and both v1 and v2 account-admin cores before loading the modular shell. This is a potential source of competing globals and version drift. It is not safe to delete them blindly because downstream compatibility may still depend on v1 globals. The next implementation step is dependency tracing, followed by removal or explicit compatibility aliases.

### Finding D — Admin CRUD presentation is functional but not production-quality

Admin v2 currently performs real protected gateway reads/mutations, but record creation/editing uses browser `prompt()` JSON entry and destructive actions use browser `confirm()`/`alert()`. These are real operations, but they violate the app-wide polished UI contract. They must be replaced with structured, validated in-app dialogs without changing the protected backend path. fileciteturn46file0L2-L6

### Finding E — server authorization must remain authoritative

The Admin core performs a client-side/admin-profile check before invoking `admin_crud_gateway`, while the database function is the real security boundary. The same rule applies to Business: UI tier gating is informational only; protected RPCs must enforce business role/tier/ownership themselves.

## Surface-to-domain audit matrix

| Surface | Core | Backend domains | Cross-core dependencies | Audit status |
|---|---|---|---|---|
| Home | Home + Game Engine + Progression | profiles, leaderboards, contests, progression | Progression, Games | Partial; make catalog/badges fully data-driven |
| Maps | Maps Core | locations, visits, check-ins, verification, favorites, amenities, routes | Progression, Social, Business | Strong modular wiring; finish presentation/accessibility and dataset coverage |
| Social | Social Core v2 + Media | posts, comments, reactions, saves, follows, notifications | Media, Progression | Needs tab/action/dialog verification |
| Profile | Profile Core v2 | profiles, subscriptions, rewards, notifications, deletion, preferences | Progression, Auth | Needs full data-driven achievements/rewards |
| Business | Business Workspace + Business Value Core | locations, events, campaigns, contests, promotions, QR, media, partners, analytics | Progression, Maps, Social | Needs full function/UI cross-reference |
| Admin | Platform Admin Core v2 | administrative gateway + all platform domains | All product domains | Incomplete domain coverage; structured editor needed |

## Permission contract

### Standard business
Basic metrics must remain visible but locked where appropriate. The expected baseline is views, check-ins, reviews, QR scans and other basic metrics. Advanced analytics/features must not be silently executable from the client.

### Advanced business tiers
Advanced analytics, campaigns, QR customization, partner capabilities, ROI/benchmark datasets and other gated operations must be enforced server-side and reflected accurately in UI entitlement states.

### Platform Admin
Admin-only operations must use protected server functions. Generic CRUD must never become a bypass around dedicated authorization RPCs such as account capability, business tier and business verification changes.

## Data authority rules

- `profiles` is authoritative for account capability state.
- business membership/role and server guards are authoritative for Business operations.
- business tier is authoritative in the database, not the client.
- verification status is authoritative in the database.
- analytics must read from canonical analytics functions/datasets rather than duplicated client calculations.
- progression points/XP must flow through the progression contract rather than feature-specific direct writes.
- map discovery may use external/cached sources, but persisted verified location identity must remain authoritative in Supabase.

## No-placeholder rule

The audit will reject:

- fake buttons;
- buttons that only change local state when a backend mutation is expected;
- hard-coded analytics presented as live data;
- static badge/reward claims where real data exists;
- CRUD controls that do not reach the authoritative mutation path;
- permission states enforced only in JavaScript;
- duplicate screens with divergent behavior;
- visual components that do not use the canonical Kleenest design language.

## Implementation sequence

1. **Complete domain inventory:** map every Supabase table, view, RPC and Edge Function to a product surface and owner.
2. **Business cross-reference:** map every Business RPC to a real UI action and permission/tier rule.
3. **Admin cross-reference:** expose every appropriate operational dataset/action in Admin with the correct mutation class.
4. **Social cross-reference:** verify every tab, post action, interaction, notification and media path.
5. **Maps cross-reference:** verify discovery/cache/verification/check-in/favorite/visit/route/progression flows against their authoritative functions.
6. **Progression cross-reference:** prove every qualifying action emits exactly one metric event and that XP/badges are derived consistently.
7. **Profile/account cross-reference:** connect subscriptions, rewards, notifications, privacy, support and deletion workflows to live data.
8. **Legacy dependency trace:** remove redundant v1 loaders only after references are proven unnecessary or replaced by explicit compatibility aliases.
9. **Visual system enforcement:** consolidate repeated styles into the shared Kleenest design system and eliminate divergent page-specific patterns.
10. **Production verification:** run functional, RLS, security, performance and regression checks after implementation.

## Current state

This is a **living audit**, not a declaration of completion. The modular branch is the source of truth for this work. Changes should be made against `refactor/monolith-removal`, validated against the production Supabase project, and documented here as each cross-reference is proven.
