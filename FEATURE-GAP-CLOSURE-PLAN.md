# Kleenest — Monolith → Modular Feature Gap Closure Plan

## Authority / source of truth

`main` is the legacy feature baseline. `refactor/monolith-removal` is production. The modular app must reproduce the useful customer and business behavior of the legacy app while moving durable state and permissions to Supabase.

The legacy application contains customer discovery, map/category discovery, route planning, details/reviews, photos, QR check-in, social/community, games, contests, rewards, accounts, subscriptions, business operations, multi-location management, promotions, events, membership clubs, partner programs, rental/single-use access, occupancy, verification and admin controls. It also contains business metrics, traffic attribution, cleanliness trends, portfolio comparisons, exports, and business media/VR concepts.

## Gap matrix

### P0 — shell/runtime correctness
- One navigation owner: modular shell only.
- Business/Admin render inside the shell content host; never replace navigation.
- Auth state drives navigation deterministically.
- Business membership and admin role are derived from Supabase, not temporary browser state.
- Map auto-location runs on startup and loads discovery without requiring the Update Location button.
- Remove all demo/monolith fallback renderers from production entrypoint.

### P0 — media/storage foundation
- Use Supabase Storage buckets: `avatars`, `review-photos`, `social-media`, `location-photos`.
- Resize/compress in the browser before upload.
- Store metadata: media type, MIME, byte size, width, height, ordering.
- Keep original files out of the application database.
- Generate durable public URLs from Storage paths.
- Enforce bucket size/MIME limits server-side.
- Profile photos: ~1200px max edge, 5 MB cap.
- Review/social photos: ~1800px max edge, 8–10 MB cap.
- Business location photos: ~2400px max edge, 12 MB cap.
- VR/360 still: up to ~4096px max edge, 12 MB cap; validate equirectangular presentation where possible.

### P0 — QR/social event pipeline
A successful QR check-in must create one authoritative server event and fan out to:
- user check-in history
- points and streak
- achievements
- contest tally
- leaderboard score
- social activity
- business/location analytics
- promotion/offer attribution when a campaign is attached

Manual check-in must not create duplicate credit for the same event.

### P0 — business permissions
Only a business Owner/Admin (or platform-authorized Enterprise Admin) may mutate:
- campaigns
- promotions/offers
- QR customization
- official location photos/VR
- partner networks/programs
- partnerships
- rewards/benefit configuration
- membership clubs
- business events
- business member roles
- verification submissions/approval as appropriate

Members can have read/operational permissions without mutation authority. UI gating is not sufficient; Supabase RPC/RLS must enforce the same policy.

### P1 — Social parity
- Public feed/activity.
- Follow/follower relationships.
- Mutual-friend messaging.
- Posts, comments, likes/reactions.
- QR check-in activity in the social feed.
- Reviews and review-photo activity in social.
- Location-linked posts.
- Photo upload from camera/gallery.
- Moderation/reporting.
- Games visible to everyone.
- Leaderboards visible to everyone.
- Contests visible to everyone.
- Participation gates enforced by subscription/account role.
- Contest actions sourced from authoritative events, not browser counters.

### P1 — business media
Business Owner/Admin:
- location gallery
- official profile/gallery photos
- VR/360 image
- media ordering
- captions
- replacement/deletion
- publish/unpublish
- per-location media

Public Details:
- optimized gallery thumbnails
- full-size image viewer
- VR/360 viewer or full-size equirectangular fallback
- source/verification labels

### P1 — exhaustive business analytics
Dataset selector should drive real calculations, not headings or seeded counters.

Datasets:
1. Overview
2. Locations
3. QR & Check-ins
4. Visitors & Retention
5. Engagement Funnel
6. Reviews & Reputation
7. Photos & Media
8. Promotions & Offers
9. Campaigns
10. Partnerships
11. Partner Network
12. Rewards/Redemptions
13. Events/RSVPs
14. Occupancy/Capacity
15. Cleaning/Quality
16. Revenue/Attribution/ROI
17. Growth/Portfolio
18. Enterprise benchmarks
19. Export/API

Every dataset needs time range, location scope, comparison period where meaningful, totals, trends, breakdowns, and export.

### P1 — campaigns/promotions/offers
- Campaign creation/edit/archive.
- Goal, audience, locations, partners, dates, budget/attribution fields.
- Promotions/offers with redemption tracking.
- QR-linked offers.
- Campaign → QR → check-in → redemption → outcome attribution.
- Admin-only mutation.

### P1 — partnerships
- Find partner.
- Partner search/filter.
- Invite/request.
- Accept/decline.
- Partner program creation.
- Location membership.
- Preferred access.
- Cooperative agreements.
- Partner analytics and benchmarks.
- Admin-only mutation.

### P1 — admin
- Managed accounts.
- Business membership management.
- Role promotion/demotion.
- Capability grants/revocation.
- Verification.
- Tier/subscription administration.
- Business/location oversight.
- Reports/moderation.
- Platform analytics.
- Audit trail for privileged actions.

### P2 — consumer parity
- Map categories and filters.
- Details and route flow.
- Reviews and photos.
- Favorites.
- Rewards history.
- Games.
- Contests.
- Leaderboards.
- Social.
- Notifications.
- Profile/settings.
- Subscription flows.

## Implementation order

1. Stabilize modular shell/navigation/auth.
2. Stabilize Supabase data boundaries and role checks.
3. Finish media/storage migration (started in this pass).
4. Finish QR → event → social/gamification → business analytics pipeline.
5. Finish Social parity and photo posting.
6. Finish Business CRUD with Owner/Admin mutation gates.
7. Finish Campaign/Promotion/Offer attribution.
8. Finish Partner Network/partnership lifecycle.
9. Replace seeded business analytics with authoritative event aggregations.
10. Finish Admin management/audit controls.
11. Add exhaustive dataset filters, date ranges and exports.
12. Run acceptance tests against consumer, premium, business member, business owner, enterprise and admin roles.

## Acceptance standard

A feature is not considered migrated when a button exists. It is migrated only when:
- the UI works;
- the Supabase data operation succeeds;
- permissions are enforced server-side;
- the operation survives reload/auth refresh;
- analytics reflect the event;
- social/gamification consequences occur where applicable;
- media is stored in Storage with size metadata;
- the modular shell remains intact;
- no legacy/monolith renderer is required.

## Current pass

Completed foundation:
- Storage metadata fields for location/review/social media.
- Storage MIME and size limits.
- Size-aware media service with client-side compression.
- Photo/VR upload helpers and durable Storage paths.
- Durable social media metadata support.

Next implementation pass should wire the existing Business/Social/QR UI to these durable media and event boundaries, then replace remaining browser-local demo counters with authoritative Supabase analytics.