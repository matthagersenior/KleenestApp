# Kleenest App Completeness & Wiring Audit

Branch: `refactor/monolith-removal`

## Audit contract

Every surface must satisfy: real initialization; real actions; real backend/core wiring; account/business permissions; shared progression; cross-core interoperability; complete loading/empty/error states; coherent visual system; and no placeholder controls.

## Current surface map

### Shell
- `kleenest-modular-shell-v1.js` is the routing owner.
- Home, Maps, Social, Profile, Business and Admin are exposed through the modular shell.
- Business now routes through the canonical Business Workspace adapter before direct fallback.
- Admin now mounts Platform Admin Core v2 rather than rendering a placeholder administration page.
- Maps now owns a dedicated navigation host so navigation presentation cannot overwrite the map renderer.

### Home
- Real XP/level/streak read from `profiles`.
- Community leaderboard and business metric leaderboard surfaces.
- Contest discovery.
- Eight game entry points through Game Engine.
- Progression navigation corrected to the canonical modular shell.
- Remaining opportunity: replace static game catalog copy with Game Engine/catalog data and expose live badge/reward data rather than descriptive copy.

### Maps
- Modular Maps Core with location, discovery, cache, session, catalog, verification, engagement, details, filters, renderer, routes, progression, social and business modules.
- Live GPS location updates.
- Cached discovery fallback.
- Location detail actions.
- Community and trusted verification paths.
- Route creation, stop management, preview, optimization, start, completion, cancellation and sharing.
- OSRM geometry and maneuver steps.
- Live maneuver presentation.
- Voice announcements based on actual maneuver data.
- Arrival detection.
- Off-route detection and provider-backed rerouting.
- Reroute route geometry/maneuver handoff back into Navigation.
- Maps actions emit progression metrics.
- Remaining opportunity: richer destination/stop detail, ETA, explicit route controls, reroute UI state, accessibility controls, navigation preferences, and deeper route/social sharing UX.

### Social
- Social Core v2 and Media Core are loaded together.
- Media is injected into Social instead of duplicating media behavior.
- Remaining opportunity: verify every tab/action against the actual Social Core implementation and ensure notification/message/detail dialogs never fall back to plain text.

### Profile
- Authentication, OAuth, identity, security, preferences, privacy, support and progression surfaces exist.
- Shared XP/level/streak are shown.
- Remaining opportunity: make badges/rewards/achievements data-driven instead of static descriptive chips; connect detailed progression metrics and challenge state.

### Business
- Canonical Business Workspace is loaded through its adapter.
- The adapter also loads the Business Gap Closer enhancement layer.
- Business feature model includes locations, engagement, QR/check-ins, visitors, reviews, media/VR, promotions, campaigns, partnerships, rewards, events, occupancy, ROI, growth, benchmarks, verification and contests.
- QR data model supports purpose, action type, action payload, customization and analytics.
- Business tier gating must remain authoritative and server-enforced.
- Remaining opportunity: expand customizable datasets/forms, expose complete QR Studio controls/preview/analytics, ensure every CRUD dialog has real save/cancel behavior, and expose advanced metrics as locked-but-discoverable features for lower tiers.

### Admin
- Platform Admin Core v2 provides protected CRUD gateway operations for users, businesses, locations, campaigns, events, contests, partnerships, promotions, social posts, badges, reports and support requests.
- Admin authorization is independently checked before gateway use.
- Shell now mounts this core.
- Remaining opportunity: remove JSON prompt-based CRUD in favor of polished structured editors and add audit history/confirmation states.

## Shared progression contract

The Progression Metrics Core defines real metrics for:
- social posts/comments/reactions/saves/follows
- contest entries/wins
- game plays
- challenge progress
- event RSVP/attendance
- check-ins
- reviews
- verification
- completed routes
- campaign engagement
- promotion redemption
- QR scans

The architectural goal is that feature cores emit these metrics rather than directly manipulating user XP.

## Shared infrastructure

Maps and Social are modular cores under `cores/`. Media and Progression are shared infrastructure. The Maps tree currently contains dedicated modules for discovery, cache, location, verification, engagement, details, routing, routes, navigation, rerouting, arrival, renderer and progression.

## Known wiring corrections made in this audit pass

1. Maps navigation UI now mounts into a separate navigation host rather than replacing the map surface.
2. Maps route creation receives the canonical routing provider.
3. Maps reroute results carry full route data back into Navigation.
4. Initial route geometry is registered with reroute detection.
5. Rerouted geometry and maneuvers are handed back to the Navigation Core.
6. Business Workspace now uses the adapter first so the gap-closer enhancement is not bypassed.
7. Platform Admin Core v2 is mounted by the modular shell.
8. Home progression navigation now targets `KleenestAppShell` instead of a stale versioned global.

## Remaining completion sequence

1. Finish Business Workspace/QR Studio structured CRUD and customization UX.
2. Audit Social tab-by-tab action wiring and dialogs.
3. Make Profile achievements/rewards fully data-driven.
4. Expand Maps navigation presentation with ETA, route deviation state, accessibility and destination details.
5. Verify all progression metrics are emitted exactly once per action.
6. Verify tier/role authorization across client and SECURITY DEFINER RPC boundaries.
7. Perform final visual consistency pass across all surfaces.
8. Run production schema/security/performance advisor checks after database changes.
