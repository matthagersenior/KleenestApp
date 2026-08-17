# Kleenest Full-App Exhaustive Audit — 2026-08-17

**Authoritative branch:** `refactor/monolith-removal`

**Audit scope:** application architecture, runtime/bootstrap, tab/core ownership, UI wiring, backend/RPC authority, authorization/RLS, data collection, analytics, progression/gamification, Maps, Business, Fleet, QR, Admin, Profile, Social, Home, pricing/entitlements, GitHub Pages/CI, design system, performance, accessibility, product focus, market positioning, monetization and next steps.

## 1. Executive verdict

Kleenest is now substantially more than a restroom finder. The branch has a credible six-surface modular architecture, a real Supabase domain model, a growing location/amenity evidence system, community verification, progression, Business, QR, Fleet and Admin capabilities.

The main risk is no longer lack of capability. It is **capability fragmentation and authority drift**: multiple historical versions remain in the repository, several pricing/entitlement representations coexist, some UI guards are presentation-only, the active bootstrap still carries compatibility loaders, and the database is materially larger than the visible product contracts.

The highest-priority work is therefore not another feature explosion. It is a hardening/consolidation pass that proves every important user action has one canonical path:

**UI intent → handler → canonical core → authoritative RPC/table → authorization → side effect → data_feature_event/progression → refreshed UI.**

### Priority summary

| Priority | Area | Finding |
|---|---|---|
| P0 | Database security | 135 public tables exist; 16 base tables currently have RLS disabled and require explicit security classification/remediation. |
| P0 | Privileged functions | 251 public-schema functions are SECURITY DEFINER; 14 are currently executable by PUBLIC. The 14 require explicit review/revocation or documented public-contract status. |
| P0 | Production QA | No GitHub Actions workflow runs are associated with the current branch head. There is no demonstrated automated regression gate for this release head. |
| P0 | Runtime authority | `index.html` loads registry v1 then v2 and shell aliases v13/v14/v15. This works by intentional replacement/compatibility, but the loader contract is still more complicated than necessary. |
| P1 | Pricing | `pricing_plans` and `pricing_catalog` coexist with materially different representations, including `premium_user` one-time purchase vs `premium` monthly and a zero-priced active Business Enterprise row in `pricing_plans`. |
| P1 | Entitlements | Business feature gating contains a browser `alert()` fallback instead of guaranteeing canonical pricing navigation when the feature gate service is unavailable. |
| P1 | Business | Open issue #6 still identifies missing CRUD, location context, record drill-down, QR surface, review replies and metric separation. |
| P1 | Maps | Maps is feature-rich and substantially wired, but its dashboard/router/renderer layering should be regression-tested together after the latest redesign commits. |
| P1 | Data quality | Public/OSM data, Kleenest observations, verification evidence and derived analytics need a formal provenance/confidence hierarchy across all datasets, not only Maps. |
| P1 | Legacy | Historical files remain numerous. They must be classified by actual runtime reachability before removal; names alone are not proof of dead code. |
| P2 | UX | Several older account/plan paths still use `prompt()`, `alert()` and browser-native flows even though Admin was upgraded to structured UI. |
| P2 | Product | The product has enough features to overwhelm new users. The next product pass should emphasize the core loop rather than adding more top-level surfaces. |

## 2. Audit contract

The original audit contract remains correct and is reaffirmed:

1. real initialization;
2. real UI action handling;
3. real core/backend wiring;
4. server-authoritative authentication/authorization;
5. account and business-tier enforcement;
6. complete loading/empty/error/success states;
7. progression integration where applicable;
8. cross-core interoperability;
9. consistent Kleenest visual system;
10. no dead, fake, placeholder or decorative controls presented as functional.

This report extends that contract with:

- data authority and provenance;
- dataset completeness and derivation;
- telemetry/event coverage;
- pricing consistency;
- business model viability;
- product-market differentiation;
- performance and dependency risk;
- operational observability;
- accessibility;
- CI/CD integrity;
- migration/schema drift;
- feature discoverability and user intent.

## 3. Current architecture

The branch has six intended top-level tab cores:

- Home
- Maps
- Social
- Profile
- Business
- Admin

The canonical tab registry maps each tab to a dedicated core and controls lifecycle/mount/destroy. The registry v2 replaces the v1 implementation with cache-busted Maps, Business and Admin core paths while preserving the canonical global registry name.

The shell is internally labeled v15 while retaining the file name `kleenest-modular-shell-v13.js` and aliases v13/v14/v15 to the same implementation. This is functional compatibility, but it creates avoidable version ambiguity and should eventually be normalized.

The branch tree still contains many historical v1/v2/v3/v4/v5 artifacts. The audit log correctly says these must be classified by actual bootstrap/consumer reachability before deletion.

## 4. Bootstrap and runtime findings

### 4.1 `index.html`

The production entrypoint is appropriately small relative to the historical monoliths, but it still loads a broad compatibility layer before the canonical shell.

Important observations:

- Supabase JS is loaded from jsDelivr using `@supabase/supabase-js@2` rather than an exact version.
- Leaflet is pinned to 1.9.4.
- Several compatibility services are loaded before the tab registry.
- Registry v1 is loaded and then registry v2 replaces it.
- Auth bridge v1 is compatibility-only but still bootstrapped.
- Fleet workspace is eagerly loaded even though Fleet is a Business capability.
- The runtime identity says shell `v15`, while the bootstrap loads `kleenest-modular-shell-v13.js` whose implementation registers v15.

**Recommendation:** make the bootstrap declarative and canonical: one Supabase loader, one registry, one shell, only truly app-lifetime services, and lazy-load Business/Fleet/Admin-specific services when their surfaces open.

### 4.2 CI/CD

The Pages workflow correctly deploys `refactor/monolith-removal`, which matches the product's authoritative branch.

The separate Supabase frontend integration workflow still targets `main` and references older script names. It should be classified as legacy/disabled for this product branch or rewritten against the canonical branch. It must not be allowed to mutate the product architecture outside the current audit authority.

### 4.3 Automated testing

The current branch head has no associated GitHub Actions workflow runs. This means the repository does not currently demonstrate an automated test/regression gate for the current release head.

**Required:** a CI gate that at minimum performs:

- syntax checking of all active JS modules;
- validation of all imported/local script paths;
- bootstrap smoke test;
- tab mount/destroy smoke test;
- Supabase RPC signature contract tests;
- entitlement tests;
- Maps discovery/check-in tests;
- QR creation schema test;
- Admin authorization test;
- migration/schema drift check.

## 5. Database audit

The production Supabase project currently exposes a substantial domain model:

- **135 public tables**;
- **298 public-schema functions**;
- **106 public base tables with RLS enabled**;
- **16 public base tables currently without RLS**.

### 5.1 Tables without RLS

The current non-RLS set includes:

- `ad_placements`
- `business_earned_perks`
- `business_geofences`
- `business_progression_events`
- `business_search_boosts`
- `family_accounts`
- `family_invites`
- `fleet_driver_scorecards`
- `fleet_maintenance_records`
- `fleet_vehicle_daily_metrics`
- `location_claims`
- `location_favorites`
- `location_route_events`
- `location_submissions`
- `pricing_plans`
- `qr_redemptions`

Not every table necessarily needs identical policies, and some may be intended as internal/derived data. Nevertheless, every exposed public-schema table needs an explicit classification and protection decision.

**P0:** audit grants + access patterns for all 16 before adding more UI around them.

### 5.2 SECURITY DEFINER functions

There are currently 251 SECURITY DEFINER functions in the public schema. Fourteen are executable by PUBLIC:

- `nearby_locations_enriched(double precision,double precision,integer,integer,uuid[])`
- `family_has_premium_access(uuid)`
- `get_effective_consumer_tier(uuid)`
- `create_family_group(text)`
- `invite_family_member(text)`
- `accept_family_invite()`
- `submit_location_info(uuid,jsonb)`
- `claim_location_for_business(uuid,uuid)`
- `location_favorite_route_metrics(uuid)`
- `_kleenest_capture_feature_event()`
- `fleet_dashboard_summary_v2(uuid)`
- `apply_user_amenity_confirmation()`
- `apply_external_amenity_to_location(uuid,text,text)`
- `apply_external_amenity_observation()`

Some of these are protected internally by `auth.uid()` checks, but PUBLIC EXECUTE on authenticated business/user mutation functions is still unnecessarily broad and should be replaced by explicit grants where possible. Trigger functions should not be treated as public API functions.

**P0:** inventory all SECURITY DEFINER functions by purpose: public read, authenticated mutation, admin mutation, trigger-only, internal analytics. Revoke PUBLIC EXECUTE from anything that is not explicitly a public contract.

### 5.3 Check-in authority

The canonical GPS check-in uses a 30-meter radius, capped at 100 meters, and the QR verification path rejects distances greater than 30 meters while describing the rule as approximately 100 feet. This matches the requested approximately-100-foot product rule, but the wording and implementation should be standardized to exactly one canonical geofence constant.

GPS check-in awards 10 points; QR check-in awards 20 points. Both emit progression/data events.

The check-in functions are server-authoritative and revoke PUBLIC EXECUTE, which is correct.

### 5.4 QR schema authority

The production `qr_codes` table does **not** contain `business_id`. It contains `location_id` plus QR metadata. The current QR Studio implementation correctly queries QR codes through business locations and does not directly select `business_id` from `qr_codes`.

This should remain a hard schema contract. Any historical QR implementation querying `qr_codes.business_id` is obsolete and must not be reintroduced.

## 6. Data architecture and collection strategy

The platform now has the foundation for a very strong data flywheel.

### 6.1 Canonical data classes

Every dataset should be classified into one of:

1. **Authoritative entity** — canonical business/location/user/vehicle record.
2. **Observation** — user/public/external observation of a property.
3. **Verification evidence** — evidence supporting an observation.
4. **Transaction/event** — check-in, QR scan, redemption, route event, RSVP, etc.
5. **Derived metric** — calculated KPI from canonical events.
6. **Prediction/intelligence** — model/heuristic output.
7. **Attribution** — source/campaign/channel linkage.
8. **Operational state** — active/inactive/open/closed/status.
9. **Provenance** — source, timestamp, confidence, verification method, freshness.

The current product has many of these but does not yet enforce this classification uniformly.

### 6.2 Location data flywheel

The desired canonical flow is:

**public source → external observation → canonical location match → amenity observation → evidence/provenance → community confirmation → trust/confidence score → Maps → Business → Fleet → analytics.**

This is one of Kleenest's strongest strategic assets.

### 6.3 Missing universal provenance contract

Every externally or community-supplied location attribute should ideally carry:

- source;
- source record ID;
- observation timestamp;
- freshness timestamp;
- verification method;
- verifier role;
- confidence;
- supporting photo/evidence ID where applicable;
- contradiction state;
- last confirmed timestamp;
- current canonical value.

This should be standardized instead of implemented field-by-field.

## 7. Maps audit

Maps is correctly treated as a core feature and now has a substantial canonical architecture:

- discovery;
- filters;
- cache;
- location/session;
- renderer;
- routing/routes;
- navigation/voice;
- verification;
- engagement;
- details;
- progression;
- external ingestion.

The current Maps core is materially stronger than the original implementation: it can fall back to DB data, uses cache, handles GPS denial, fits results, and owns lifecycle teardown.

### Remaining Maps risks

1. The presentation layer has been iterated rapidly and needs a full interaction regression pass after the latest redesign.
2. Maps has multiple historical dashboard/surface files. Only the active renderer/core path should remain runtime-authoritative.
3. Search, filtering and tab state currently mix client-side result filtering with core-level filtering. These rules should be consolidated.
4. Favorites and verification filters must be tested against actual returned field names, not assumed aliases.
5. Route planner must be tested through the full sequence: select → add stop → preview → optimize → start → share → clear.
6. Accessibility needs explicit keyboard/focus/ARIA verification on map controls and modal overlays.

## 8. Home / core user loop

The product's core consumer loop should remain:

**Open → see nearby useful restrooms → choose → navigate → check in → verify/rate → earn → improve the dataset.**

The proposed home-page Check In action is strategically correct because it removes friction from the most valuable recurring action.

The QR check-in should remain the premium/high-value verification path, while GPS check-in is the lower-friction path.

The home screen should avoid becoming a dashboard. It should prioritize one obvious next action, nearby locations, and progression feedback.

## 9. Verification / reviews / trust

The location trust model is one of the most differentiated parts of the product.

Recommended canonical trust layers:

- Public source
- Business supplied
- Community observed
- Community verified
- Repeatedly verified
- Recently verified
- Photo-backed
- Contradicted/stale

Ratings should not be the same thing as verification. A 5-star restroom can have stale amenity data; a newly verified restroom can have no rating yet.

The review system should support:

- 1–5 stars;
- text feedback;
- amenity-specific feedback;
- photos;
- helpful/like voting;
- verification actions;
- freshness;
- contradiction/reporting;
- trust score.

The existing schema supports much of this, but the UI should present these concepts as one coherent trust model rather than separate features.

## 10. Gamification audit

The game engine/progression layer is a major asset, but it should be made more systematic.

### Core action classes

Every valuable user behavior should have a single progression event contract:

- GPS check-in
- QR check-in
- bathroom verification
- amenity confirmation
- amenity correction
- photo
- useful review
- review helpful vote
- location submission
- location correction
- favorite
- route completion
- new location discovery
- stale-data refresh
- contradiction resolution
- business verification assistance
- fleet location verification
- challenge completion
- referral/activation

### Anti-abuse requirements

Every rewardable action needs:

- idempotency;
- actor ownership;
- cooldown where appropriate;
- geofence where appropriate;
- duplicate detection;
- source classification;
- fraud/velocity monitoring;
- server-side points authority.

The existing audit log shows that several reward-integrity issues have already been hardened. The next step is to prove event coverage and idempotency across every remaining rewardable action.

## 11. Business audit

Business is now correctly conceptualized as three dashboards:

1. **Business Tools**
2. **QR Studio**
3. **Fleet Dashboard**

This is the right information architecture.

However, GitHub issue #6 remains the authoritative return point for Business completeness. It identifies missing or incomplete:

- Contest CRUD
- Campaign CRUD
- Partnership CRUD
- Promotion/Event CRUD verification
- location selector/context
- record drill-down
- QR Studio exposure/wiring
- review replies
- analytics metric separation

The largest product-quality concern is metric duplication. Growth, Intelligence, Engagement, Benchmarks, Verification, Tier and Occupancy must each answer a distinct business question.

### Recommended Business metric taxonomy

**Growth:** new customers, repeat customers, growth rate, acquisition channels.

**Engagement:** check-ins, QR scans, reviews, favorites, shares, campaign interactions.

**Verification:** verified locations, freshness, evidence coverage, contradiction rate, confidence.

**Occupancy:** demand/utilization proxy with explicit methodology.

**Intelligence:** anomalies, recommendations, opportunities, cross-dataset insights.

**Benchmarks:** peer/category/location comparisons.

**ROI:** attributed outcomes, campaign value, operational savings.

**Tier:** entitlement, usage, limits, unlocked capabilities and upgrade value.

## 12. QR Studio audit

QR Studio is now schema-aware and uses the existing `business_create_custom_qr` contract.

It correctly avoids the historical `qr_codes.business_id` mistake.

Current strengths:

- URL QR;
- check-in;
- promotion;
- contest;
- offer;
- campaign;
- custom payload;
- location-specific codes;
- colors;
- quiet zone;
- preview;
- PNG export;
- copy payload;
- saved codes;
- scan/check-in/redemption statistics;
- single-use support.

Remaining gaps:

- edit/update QR metadata;
- activate/deactivate UI;
- delete/archive policy;
- scan attribution detail;
- conversion funnel;
- campaign attribution drill-down;
- redemption detail;
- QR-level performance comparison;
- exportable analytics;
- business/location permission enforcement in every mutation path.

## 13. Fleet audit

Fleet is correctly subordinate to Business rather than becoming a seventh top-level tab.

Current workspace includes:

- overview;
- vehicles;
- drivers;
- routing;
- restroom coverage;
- location intelligence;
- maintenance;
- safety scorecards;
- telematics;
- service opportunities;
- alerts;
- analytics;
- reports;
- integrations;
- compliance;
- ROI.

The database currently contains Fleet-specific operational datasets including driver scorecards, maintenance records and vehicle daily metrics.

### Fleet gaps

The current UI is a strong shell but many capabilities are still read/analytics oriented rather than complete operational workflows.

Next required wiring:

- vehicle create/edit/archive;
- driver assignment/unassignment;
- route creation/editing;
- alert acknowledgement/closure;
- maintenance status transitions;
- telemetry ingestion status;
- service opportunity assignment;
- route optimization constraints;
- reporting/export;
- role-based Fleet permissions;
- enterprise fleet multi-business context.

## 14. Admin audit

Admin is moving toward the correct concept: **Platform Data Control Center + Admin Tools**.

The dataset grouping is comprehensive and now includes users/growth, locations/trust, Business/QR, Fleet/Enterprise, community/gamification and platform operations.

The Admin Core also exposes an Admin Tools view.

### Remaining Admin gaps

Admin must become an actual operational control plane, not only a dataset browser.

Required tool categories:

- runtime health;
- error inspection;
- feature flags;
- entitlement repair;
- account capability repair;
- business verification repair;
- business tier repair;
- location merge/split;
- duplicate location resolution;
- data provenance correction;
- failed ingestion retry;
- stale-data refresh;
- QR diagnostics;
- progression/reward repair;
- event replay/idempotency inspection;
- cache invalidation;
- audit log;
- RPC health;
- storage health;
- RLS/security diagnostics;
- orphan dataset review;
- feature adoption metrics.

Every mutation must use an explicit protected admin operation and record an audit event.

## 15. Pricing and monetization audit

Current active `pricing_plans` include:

- Free: $0
- Premium: $5/month
- Family Premium: $20/month
- Business Standard: $20/month
- Business Growth: $50/month
- Business Fleet: $100/month
- Business Enterprise: $0 in this table

The `pricing_catalog` contains a different representation including:

- Premium User: $5 one-time
- Premium: $5/month
- Family: $20/month
- Business Standard: $20/month
- Business Growth: $50/month
- Fleet Users: $75/month
- Enterprise Users: inquire
- Business Enterprise: inquire

This is a **pricing authority conflict**.

The product cannot safely have multiple competing sources of truth for plan price/interval/features.

### Required pricing authority

Create one canonical pricing/entitlement contract:

**pricing product → plan → tier → feature catalog → entitlement rule → usage limit → checkout/purchase product.**

Historical pricing tables should either become compatibility/read-only sources or be removed after dependency tracing.

The `premium_user` one-time $5 offering especially needs a deliberate product decision because it currently conflicts semantically with monthly Premium.

## 16. Entitlement audit

The Business entitlement guard is useful but not sufficient as the sole product contract.

Current issue:

When the canonical feature-gate service is unavailable, the fallback uses `alert()` rather than guaranteeing navigation to pricing.

Required behavior:

**Locked feature clicked → pricing modal/page opens → exact required tier highlighted → relevant feature explained → purchase/upgrade path → return to original intent.**

Server-side authorization remains the actual enforcement boundary.

## 17. UX / design system audit

The branch has a shared design system and substantial work has already been done to normalize brand tokens.

Remaining issue is not lack of styling. It is **style proliferation**.

There are many component-specific style blocks and generation-specific CSS files. The goal should be:

- one spacing scale;
- one radius scale;
- one shadow system;
- one typography scale;
- one action hierarchy;
- one trust-state vocabulary;
- one card system;
- one modal system;
- one empty/loading/error pattern.

Maps, Business and Fleet now look increasingly app-native, but the audit should continue until every surface feels like the same product.

## 18. Accessibility audit

Required app-wide checks:

- keyboard navigation;
- visible focus;
- semantic buttons rather than clickable divs;
- modal focus trap;
- ESC dismissal;
- screen-reader labels;
- map control alternatives;
- color-independent trust indicators;
- sufficient contrast;
- touch target sizing;
- reduced-motion behavior;
- error messages tied to fields;
- no information conveyed by color alone.

Maps and Admin deserve particular attention because they contain dense interactive controls.

## 19. Performance audit

Primary risks:

- many scripts loaded eagerly from the bootstrap;
- multiple compatibility layers;
- CDN dependencies;
- repeated dynamic script loading with cache-busting query parameters;
- large historical HTML artifacts in the repository;
- repeated dashboard enhancement/MutationObserver patterns.

The correct direction is progressive loading:

**shell → surface core → surface-specific services → optional analytics/tools.**

Maps should load only map dependencies. Business should not load Fleet/QR until selected. Admin tools should lazy-load. Social/media should not be paid for by anonymous Maps-only sessions.

## 20. Market / competitive position

The restroom-finder market is real but crowded. Current app-market listings show Flush Toilet Finder & Map as a leading consumer competitor with roughly 10K ratings and more than 200K bathrooms, while many other free restroom apps compete on simple proximity and directions. citeturn0search9turn0search6

Google Maps is a much larger horizontal competitor. Its current Places APIs include restroom and accessibility attributes, and Google Maps allows users to update accessibility attributes and submit accessibility information through reviews. citeturn0search2turn0search1

Therefore Kleenest should **not** position itself as merely "another restroom map."

The defensible positioning is:

> **The trusted restroom intelligence network.**

The moat is the structured dataset and feedback loop:

**location identity + restroom status + amenity inventory + accessibility + freshness + community evidence + business data + route intelligence + fleet/enterprise operational intelligence.**

That is substantially harder to reproduce than a list of restroom pins.

## 21. Product focus / intent

The platform currently contains enough capability to become confusing.

The user-facing product should have a very simple mental model:

### Consumer
**Find → Trust → Navigate → Check in → Improve → Earn.**

### Business
**Understand → Improve → Promote → Measure.**

### Fleet
**Plan → Route → Cover → Operate → Measure.**

### Admin
**Observe → Diagnose → Correct → Audit.**

### Enterprise
**Coordinate → Measure → Benchmark → Optimize.**

Everything else should support one of these loops.

## 22. Highest-value next datasets

### Consumer/location

- freshness score;
- contradiction score;
- amenity confidence;
- accessibility confidence;
- time-of-day availability;
- access requirement history;
- wait/occupancy observations;
- cleanliness trend;
- amenity reliability;
- location closure probability;
- source agreement score;
- verification velocity;
- verification decay.

### Business

- verified coverage rate;
- data completeness score;
- customer trust score;
- repeat visitor rate;
- QR funnel;
- campaign-to-visit conversion;
- offer redemption rate;
- review response rate;
- amenity completeness;
- location freshness;
- benchmark percentile;
- ROI attribution.

### Fleet

- restroom availability reliability;
- stop success rate;
- route deviation;
- route efficiency;
- time saved from restroom-aware routing;
- stale-location avoidance;
- service opportunity value;
- driver restroom stop patterns;
- coverage density;
- fleet-specific amenity requirements;
- maintenance/route correlation.

### Admin

- feature adoption;
- RPC error rate;
- failed mutation rate;
- orphan dataset count;
- stale dataset count;
- entitlement mismatch count;
- event pipeline lag;
- duplicate event rate;
- data confidence distribution;
- ingestion health;
- location matching quality;
- public-source coverage.

## 23. Data mining opportunities

The platform can eventually derive higher-order intelligence without collecting private/personal information:

- restroom reliability scores;
- amenity availability prediction;
- stale-data detection;
- likely-closed location detection;
- best-stop ranking;
- route quality scoring;
- location trust ranking;
- accessibility confidence;
- demand heatmaps;
- amenity demand trends;
- business opportunity scoring;
- fleet route optimization;
- verification priority queues;
- public-source contradiction detection;
- business data completeness recommendations.

The important rule is to keep these as derived datasets with explicit provenance rather than overwriting canonical facts.

## 24. Dead/legacy code strategy

Do not delete historical files solely because their names contain v1/v2/v3.

For each file classify:

- active runtime;
- dynamically imported runtime;
- compatibility facade;
- explicit audit/reference artifact;
- historical snapshot;
- orphan.

Then delete only confirmed orphans.

The branch has already successfully removed historical shell generations using this methodology. Continue it for Business, Maps, Admin, Account, Social and Profile bridges.

## 25. Required P0 implementation batch

1. RLS/security review of the 16 non-RLS tables.
2. PUBLIC EXECUTE review/revocation for the 14 public-executable SECURITY DEFINER functions.
3. Build automated branch CI smoke tests.
4. Establish one pricing authority.
5. Establish one entitlement authority.
6. Make every locked-feature path redirect to canonical pricing.
7. Prove active bootstrap/runtime dependency graph.
8. Prove every canonical tab mounts and destroys cleanly.
9. Prove Maps end-to-end with GPS allowed/denied and no data.
10. Prove QR end-to-end against the actual schema.
11. Prove Fleet end-to-end for a Fleet-tier business and non-Fleet denial.
12. Prove Admin tools execute protected mutations and log them.

## 26. Required P1 implementation batch

1. Finish Business issue #6.
2. Finish location context switching.
3. Finish review reply workflow.
4. Finish QR lifecycle management.
5. Finish Fleet operational mutations.
6. Finish provenance/confidence normalization.
7. Finish universal data-feature event coverage.
8. Finish progression idempotency coverage.
9. Finish app-wide accessibility pass.
10. Finish design-system consolidation.
11. Finish lazy-loading/performance pass.
12. Finish public-data ingestion coverage and matching quality.

## 27. Required P2/product batch

1. Simplify consumer onboarding.
2. Make Home Check In a primary action.
3. Make QR check-in clearly higher-value than GPS check-in.
4. Make the contribution/reward loop visible immediately after a user action.
5. Make trust/freshness obvious on location cards.
6. Reduce dashboard duplication.
7. Create a concise pricing/value story.
8. Build business upgrade flows around measurable outcomes.
9. Build Fleet around measurable operational savings.
10. Build Enterprise around network-level benchmarks and optimization.

## 28. Definition of done for the next major milestone

The app should not be considered production-ready until:

- every top-level tab has one canonical owner;
- every user-visible action has a verified backend path;
- every mutation has server authorization;
- every exposed public table has an intentional RLS/access decision;
- every SECURITY DEFINER function has an intentional execution grant;
- pricing has one source of truth;
- entitlements have one source of truth;
- every locked feature routes to pricing;
- Maps works with and without GPS;
- check-ins are server-geofenced and idempotent;
- QR uses the actual schema and authoritative RPC;
- Business metrics are non-duplicative;
- Fleet operational workflows are actually mutable where intended;
- Admin can diagnose and correct platform issues through protected tools;
- every valuable action emits the appropriate event exactly once;
- the visual system is consistent;
- CI proves the canonical branch boots and the major surfaces mount;
- no placeholder/fake/decorative controls remain.

## 29. Final assessment

**Architecture:** strong direction, still consolidating.

**Data model:** unusually rich and potentially the strongest long-term moat.

**Maps:** core product quality is high in capability; presentation and regression hardening remain critical.

**Business:** strong foundation, but feature breadth currently exceeds metric/UI coherence.

**Fleet:** promising and now materially broader, but still more dashboard than complete operational product.

**QR:** strong and schema-correct after the earlier `business_id` issue; needs lifecycle/analytics completion.

**Admin:** rapidly becoming the correct platform control plane; needs more operational repair tools and stronger diagnostics.

**Gamification:** strong foundation; needs systematic event coverage, anti-abuse and visible feedback loops.

**Pricing:** currently inconsistent enough to require canonicalization before aggressive monetization work.

**Security:** materially hardened compared with the original state, but the current 16 non-RLS tables and 14 PUBLIC-executable SECURITY DEFINER functions require immediate review.

**CI/CD:** Pages is correctly tied to the authoritative branch, but automated product regression coverage is insufficient.

**Market:** crowded at the simple restroom-finder layer; differentiated at trusted restroom intelligence + verification + business + fleet/enterprise data.

**Overall:** Kleenest has reached the point where **consolidation, authority, trust, observability and execution quality are more valuable than adding another major feature family.** The next stage should turn the existing breadth into a reliable, measurable, defensible platform.
