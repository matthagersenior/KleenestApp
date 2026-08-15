# Business / Enterprise Modular Wiring

## Status
- Authoritative application branch: `refactor/monolith-removal`.
- The monolith remains reference-only.
- Maps initialization is intentionally paused for later attention.

## Business surface wired
The modular runtime now loads the existing business feature set before the shell:
- `kleenest-business.js`
- `kleenest-business-analytics.js`
- `kleenest-business-state.js`
- `kleenest-business-management.js`
- `kleenest-business-actions.js`
- `kleenest-business-action-dispatcher.js`
- `kleenest-business-render.js`
- `kleenest-business-ui.js`
- `kleenest-business-workspace.js`
- `kleenest-business-dashboard.js`

The shared Supabase JS/client/runtime bridge is loaded before these modules so membership, locations, reviews, promotions, protected RPCs, and reporting functions use the modular runtime's data layer.

## Business tab
The modular shell now exposes a Business tab and mounts `KleenestBusinessWorkspace` directly. The workspace already contains the feature-rich dataset surface for:
- Overview
- Locations
- Engagement
- QR & Check-ins
- Visitors & Retention
- Reviews & Reputation
- Photos & Media
- Promotions & Offers
- Campaigns
- Partnerships
- Rewards & Redemptions
- Events
- Occupancy
- ROI
- Growth & Intelligence
- Benchmarks
- Verification & Tier

Location filtering and analytics dataset selection remain owned by the existing business workspace/analytics modules.
