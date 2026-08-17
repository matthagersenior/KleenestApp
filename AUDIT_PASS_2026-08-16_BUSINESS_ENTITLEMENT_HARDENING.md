# Business Entitlement Interaction Audit — 2026-08-16

**Authoritative branch:** `refactor/monolith-removal`

## Scope

Re-audited Business feature presentation after the Business surface ownership P0 fix.

## Finding — P1

The entitlement presentation guard identified advanced features by reading the visible `<h3>` text. This was fragile because entitlement pills are appended to the same heading, so repeated MutationObserver passes could stop recognizing the feature and leave stale entitlement state.

## Fix

`kleenest-business-feature-entitlement-enforcer-v1.js` now:

- derives the feature identity from the existing `data-biz-crud` key;
- maps required tiers by stable feature key rather than display text;
- limits observation to `.kbfgb` inside `#km-business`;
- keeps server-side Business CRUD authorization authoritative;
- keeps Standard users locked out of Growth/Enterprise CRUD actions;
- keeps Partner Programs Enterprise-only;
- provides an in-app upgrade notice when a locked feature is selected instead of silently disabling the interaction or using browser dialogs;
- removes the previous repeated-text parsing dependency.

## Entitlement contract

- Standard: included/core Business capabilities.
- Growth: Promotions, Events, Campaigns, Contests, QR Studio, Metric Leaderboards, Preferred Use Analytics, Engagement Attribution.
- Enterprise: Partner Programs and enterprise partner outcomes.
- Advanced write actions remain restricted to owner/admin/manager roles.

## Verification

- Confirmed the feature-gap bridge emits stable `data-biz-crud` identifiers.
- Confirmed the canonical feature registry defines the same Growth/Enterprise feature boundaries.
- Confirmed Business CRUD independently re-authorizes membership, role, tier, feature, business ID, and write permission.
- Confirmed the entitlement guard cannot grant server-side access.

## Remaining runtime verification

Exercise Standard, Growth, and Enterprise business memberships in the deployed app and verify locked-feature upgrade messaging, permitted CRUD, role restrictions, and navigation back to non-Business tabs.
