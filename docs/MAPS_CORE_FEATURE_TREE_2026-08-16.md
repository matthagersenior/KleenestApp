# Kleenest Maps Core — Comprehensive Feature Tree & Rebuild Outline

**Waypoint:** `waypoint/social-gamification-maps-rebuild-2026-08-16`

**Authoritative app branch:** `refactor/monolith-removal`

**Primary source branch reviewed:** `refactor/maps-details-verification`

**Reference branches reviewed:** `rollback/2026-08-15-business-maps-known-good`, `backup/pre-monolith-removal-2026-08-12`, `backup/main-before-refactor-pages`, `backup/pre-ui-migration-2026-08-12`, `demo/legacy-monolith`, `demo/legacy-monolith-docs`, `demo/legacy-monolith-docs2`, `native-foundation` through `native-foundation-v7`, `restore-index-safe`, `sync-main-into-refactor`.

## 1. Architecture rules

Maps is a **core**, not a page-level script.

```text
App Shell
└── Maps Core
    ├── Location/GPS Service
    ├── Discovery Service
    ├── Cache/Session Service
    ├── Catalog/Verification Service
    ├── Engagement Service
    ├── Map Renderer
    ├── Details/Actions Surface
    ├── Filters/Search Surface
    ├── Gamification Adapter
    └── Social Adapter
```

The shell owns navigation and dependency injection. Maps Core owns Maps behavior. GPS/discovery must never be reimplemented by a renderer or individual surface.

## 2. Persistent location/GPS service

### `Map Location Service`
- Single `watchPosition` lifecycle.
- Shared current location and accuracy.
- Shared GPS promise for concurrent requests.
- Immediate GPS warm-up on app open.
- First usable fix starts nearby discovery.
- Manual `Update my location` obtains a fresh position.
- No duplicate watchers when navigating away/back.
- GPS survives surface remounts.
- Permission/unavailable/error states are non-fatal to the rest of the app.

### Persistent state
- Current user coordinates.
- Accuracy.
- GPS readiness.
- Last successful refresh.
- Map center/zoom.
- Category filter.
- Amenity filter.
- Selected location.

## 3. Discovery service

### Sources
- Supabase canonical location catalog.
- OSM.
- Overpass.
- Government/public datasets.
- Trusted public datasets/adapters.
- Business-owned locations.
- Community-created locations.
- Existing application location data.

### Candidate categories
- Bathrooms.
- Gas stations/travel stops.
- Fast food/restaurants.
- Cafes.
- Hospitals/healthcare.
- Parks/recreation.
- Retail.
- Libraries.
- Airports.
- Transit.
- Lodging.
- Government/public.
- Worship.
- Financial.
- Culture/community.
- Other useful nearby places.

All broad-source records are **candidates** until the bathroom verification policy promotes them.

### Discovery behavior
- Fast cached/hydrated results first.
- Supabase and external discovery can run concurrently.
- Do not clear visible results while background refresh runs.
- Merge and deduplicate instead of replacing the catalog.
- Bound public marker rendering.
- Bound candidate storage separately.
- Persist provenance.
- Source-dataset/external-ID deduplication.
- Background refresh belongs to the persistent service, not the renderer.

## 4. Catalog model

Canonical `locations` data includes:
- identity/name/address.
- coordinates/geography.
- business relationship.
- source/provenance.
- verification status.
- bathroom verification status/counts.
- amenities.
- fixtures.
- photos.
- rating/reviews.
- cleanliness.
- accessibility.
- changing table.
- smart-bathroom state.
- geofence radius.
- promotions.
- QR relationship.
- active/premium state.

Related tables include:
- `location_hours`
- `amenities`
- `location_amenities`
- `location_fixtures`
- `location_photos`
- `reviews`
- `review_photos`
- `review_amenity_feedback`
- `qr_codes`
- `promotions`
- `business_events`
- `social_posts`
- `location_visits`
- `preferred_location_activations`

## 5. Bathroom verification gate

Verification is a **community data-collection and progression system**, not merely a visual badge.

### States
- `unverified`
- `has_bathroom`
- `no_bathroom`

### Requirements
- GPS-gated.
- Configurable geofence, currently centered around 150m for community verification/check-in flows.
- Authenticated user.
- Auditable user/location record.
- One meaningful contribution per user/location to prevent farming.
- Aggregate positive/negative counts.
- Verification source and timestamp.
- Promotion into confirmed restroom status only after the defined verification rule.

### Tables
- `location_bathroom_verifications`
- `location_verification_points`
- `locations.bathroom_verification_*`

## 6. Maps renderer

### Map
- Leaflet.
- OpenStreetMap tiles.
- Self-contained markers.
- User location marker.
- Kleenest/business marker differentiation.
- Verified/unverified visual differentiation.
- Legend.
- Recenter control.
- Responsive sizing.
- Bounded marker count.
- Non-blocking Leaflet initialization.

### Result list
- Name.
- Address.
- Distance.
- Location type.
- Kleenest/business badge.
- Bathroom status.
- Selection state.
- Details action.
- Directions action.

## 7. Filters and discovery UX

### Categories
- All.
- Bathrooms.
- Gas.
- Fast food/restaurants.
- Cafes.
- Hospitals.
- Parks.
- Retail.
- Libraries.
- Airports.
- Transit.
- Public/government.
- Hotels/lodging.
- Other.

### Amenities
- Accessible.
- Baby changing.
- Family.
- Gender neutral.
- Urinals.
- Stalls.
- Sinks.
- Soap.
- Paper towels.
- Hand dryer.
- Changing table.
- Shower.
- Drinking water.

### Future filter groups
- Cleanliness.
- Rating.
- Distance.
- Open now.
- Verified status.
- Business tier.
- Premium/Kleenest locations.
- Accessibility/family needs.

## 8. Location details core

Selecting a result must open a **real details surface**, not a placeholder.

### Details
- Name/address.
- Distance.
- Bathroom verification state.
- Amenities.
- Fixtures.
- Hours.
- Cleanliness.
- Rating/review count.
- Photos.
- Business information.
- Promotions/offers.
- Events.
- QR/check-in availability.
- Accessibility.
- Community activity.
- Recent reviews.
- Verification history where permitted.

### Actions
- Directions.
- Check in.
- Favorite/unfavorite.
- Review.
- Add/report information.
- Verify bathroom when GPS-qualified.
- View business/promotions/events.
- Share.
- Return to results.

## 9. Engagement core

Maps engagement must be account-backed and feed the central progression system.

- Views.
- Location visits.
- Check-ins.
- Favorites.
- Reviews.
- Amenity feedback.
- Bathroom verification.
- Shares.
- Route usage/completion.
- Preferred-location activation/use.
- Promotion redemption.
- Event RSVP/attendance.
- QR scans.

Every action must enforce authentication and ownership/eligibility rules server-side.

## 10. Gamification/progression integration

Maps should emit canonical progression events rather than directly manipulating XP.

```text
Maps action
→ Maps Engagement Core
→ Progression Metrics Core
→ progression_metric_events
→ progression action/scoring
→ point_transactions/profile totals
→ level/badge/streak state
→ Social activity/notification
```

Metrics include:
- map view.
- unique location visit.
- check-in.
- favorite.
- review.
- amenity verification.
- bathroom verification.
- route stop.
- completed route.
- shared discovery.
- event participation.
- promotion redemption.
- QR scan.
- contest participation.
- challenge progress.
- game activity.

Anti-abuse rules belong in the progression/data layer, not in UI code.

## 11. Social integration

Maps should be able to create social activity for meaningful actions:
- verified a location.
- discovered a new location.
- completed a route.
- checked in.
- reviewed a restroom.
- won/completed a challenge.
- participated in an event.
- redeemed a business promotion.

Social must consume Maps events through an explicit adapter/event contract rather than reaching into Maps internals.

## 12. Business integration

Business-owned locations remain part of the same Maps catalog.

Business Core supplies:
- location ownership.
- location CRUD.
- business tier/permissions.
- amenities.
- fixtures.
- hours.
- photos/media.
- QR.
- promotions.
- campaigns.
- contests.
- events.
- analytics.

Maps consumes authorized business data; Maps must not duplicate business CRUD logic.

## 13. Routes

Existing route schema provides a foundation:
- `route_plans`
- `route_stops`
- `route_events`

Core features:
- create route.
- add locations/stops.
- order stops.
- start route.
- complete stops.
- complete route.
- points per stop.
- route completion points.
- route sharing.
- route history.
- progression/social integration.

## 14. QR integration

Maps locations connect to QR codes for:
- check-in.
- business actions.
- promotion actions.
- contest actions.
- offer actions.
- custom actions.

QR Studio remains its own core. Maps consumes the QR contract.

## 15. Persistence/session contract

The historical Maps persistence checkpoint established:
- warm GPS state.
- cached locations.
- separate candidate storage.
- seven-day stale cache window.
- shared `KleenestLocations`.
- shared `KleenestMapCandidates`.
- preserved map state.
- one manual location action.

The current preloader uses a bounded persistent cache and shared GPS watcher. This behavior should be preserved during the rebuild.

## 16. Navigation contract

The Maps navigation path must:
- mount Maps immediately.
- not wait for identity/business/subscription hydration.
- not wait for unrelated verification modules.
- not await Leaflet/network initialization.
- show the Maps shell before slow work completes.
- retain shared GPS/cache when navigating away.
- remount from cache instantly.
- run discovery in the background.

This was specifically introduced after the Maps lockup investigation.

## 17. Performance/safety rules

- No document-wide MutationObserver loops.
- No recursive textContent mutations.
- No unbounded marker creation.
- No unbounded candidate persistence.
- No duplicate GPS watchers.
- No duplicate discovery pipelines.
- No renderer-owned network orchestration.
- No blocking shell awaits for Maps.
- No clearing visible results during refresh.
- No client-only verification/ownership decisions.

## 18. Monolith reference inventory

The legacy/reference implementations include multiple large HTML generations:
- `Index3.html`
- `Index4.html`
- `Kleenest_index_pass3.html`
- `index-fixed.html`
- `index2.html`
- `index5.html`
- `index6.html`
- `index7.html`

These are **reference sources**, not the production architecture. They must be mined for behavior/features and then translated into explicit Maps Core modules.

## 19. Historical Maps implementation lineage

The dedicated Maps branch contains a concentrated sequence of Maps work, including:
- location details rendering.
- geo-fenced bathroom verification.
- Maps v61 details.
- details verification shell v42.
- persistent Maps data service.
- non-blocking Maps surface.
- Maps navigation guard.
- app-open GPS/discovery behavior.
- candidate/catalog persistence.
- source ingestion and deduplication.

Important historical commits documented in the branch notes include:
- `d06bd53603c52698f5d85d013a308074dba36c1c` — Fix Maps location details view.
- `7e968a97e56ed5ffd820ed21338bdd34de8d0a11` — fix Maps details rendering and geo-fenced bathroom verification.
- `2affc47437e9be40d4d402aed6bd4cb87361a575` — load Maps v61 details and geo-fenced verification.
- `06e2fd73f55ae45a91e4665dd0a10312bd3d0f41` — bootstrap Maps details verification shell v42.
- `d8e236da693b61e9a7c64495e68a03e9aa1c8eea` — fix Maps MutationObserver lockup.
- `cf067b4e9b15bfa1a2ab72a7fd88286ff081bf20` — Maps surface v47 non-blocking mount and isolated Leaflet initialization.
- `1a6280ed93a9437a3891754e5e653b3dfd89e81e` — Maps navigation guard bypassing blocking shell hydration.
- `0380949c214728d3b0043b1067018281dfabd044` — modular entry loads the fast Maps navigation path.

## 20. Rebuild target

The new Maps Core should be a small coordinator around explicit modules:

```text
cores/maps/
├── maps-core.js                 # public coordinator / lifecycle
├── maps-location.js             # GPS watcher + shared position
├── maps-discovery.js            # Supabase + OSM/Overpass adapters
├── maps-cache.js                # persistence + hydration
├── maps-session.js              # center/filter/selection state
├── maps-catalog.js              # normalize/dedupe/provenance
├── maps-verification.js         # bathroom verification contract
├── maps-engagement.js           # views/check-ins/favorites/reviews
├── maps-details.js              # complete location detail surface
├── maps-filters.js              # categories/amenities/search
├── maps-renderer.js              # Leaflet/map/list rendering only
├── maps-routes.js                # route planning/progress adapter
├── maps-progression.js           # progression event adapter
├── maps-social.js                # social activity adapter
├── maps-business.js              # business-location adapter
└── maps-theme.css                # Maps-specific visual system
```

The module boundary is intentional: **simple workflow, explicit contracts, no patches, no compatibility layers, no duplicated service ownership.**

## 21. Verification plan before replacing the current surface

1. Cold launch warms GPS.
2. Cached Maps paints immediately.
3. Fresh Supabase + OSM/Overpass discovery runs in background.
4. Navigation remains responsive.
5. No duplicate watchers after repeated Home → Maps navigation.
6. Filters work.
7. Location selection opens full details.
8. Details actions work against real services.
9. Bathroom verification is GPS-gated and auditable.
10. Check-in/favorite/review emit progression events.
11. Route progress emits progression events.
12. Social activity is generated through the Social adapter.
13. Business-owned location data obeys business permissions.
14. Candidate records never silently become confirmed bathrooms.
15. Public rendering remains bounded.
16. Cache survives navigation and reload.
17. Manual Update Location refreshes both discovery sources.
18. Failure of Leaflet/OSM/Supabase does not take down the rest of the app.

## 22. Source-of-truth rule

The monolith and historical Maps branches are **feature references**. The new Maps Core on `refactor/monolith-removal` is the only production implementation target. Do not resurrect the monolith or stack another Maps patch on top of it.
