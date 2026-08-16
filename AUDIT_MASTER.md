# Kleenest Master Application Audit

No placeholders. Every actionable control must have a real handler and authoritative backend path. Account and Business permissions remain authoritative in Supabase. Admin datasets are classified as mutable or read-only. The canonical visual language is the Kleenest design system.

## Findings
- Production contains substantially more domains than the original Admin UI exposed: bathroom verification, location visits, QR, progression, challenges/games, subscriptions/pricing, certifications, partner networks, preferred-location usage, analytics, support/feedback, deletion requests, and social moderation.
- `admin_get_overview()` previously returned only pending businesses, unresolved reports, and health while the UI expected many more metrics.
- The shell was loading `kleenest-platform-admin-core-v1.js` even though a v2 implementation existed.
- The Admin gateway had a broader allowlist than the visible Admin UI.
- Business already has real CRUD/analytics RPCs for promotions, events, campaigns, contests, QR, media, locations, and partner programs.

## Current pass
- Expanded the authoritative Admin overview metrics.
- Hardened the Admin CRUD gateway with explicit read-only classifications for sensitive/derived datasets.
- Added the master audit baseline.

## Remaining audit
- Verify every consumer and business button against handler -> RPC -> database -> result.
- Verify map discovery, caching, import/source reconciliation, and GPS startup.
- Verify Business Standard/Growth/Enterprise entitlements at every advanced action.
- Verify CRUD refreshes dependent datasets and analytics.
- Run security/performance advisors after database changes.
- Remove duplicate/obsolete modules only after dependency tracing.
