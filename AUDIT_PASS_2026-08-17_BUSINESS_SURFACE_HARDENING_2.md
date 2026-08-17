# Business Surface Hardening Pass 2 — 2026-08-17

**Authoritative branch:** `refactor/monolith-removal`

## Scope

Second fine-toothed audit of Business surface ownership, entitlement presentation, duplicate Business tool catalogs, and direct Business QR mutation paths.

## Findings

### P1 — Business Tool entitlement enforcement depended on card heading text

The existing entitlement guard inferred feature identity from rendered `<h3>` text. This was brittle and caused the `Partner Program` card to evade the `Partner Programs` rule because the rendered label is singular while the entitlement map was plural.

**Fix:** entitlement enforcement now identifies the feature from the stable `data-biz-crud` dataset key and delegates tier/role evaluation to the canonical Business feature registry exposed by the Business runtime bridge.

### P1 — Business workspace adapter retained a shared-container fallback

The adapter could fall back from an explicit root to `#km-workspace` or `#modular-workspace`, reopening the same cross-surface leakage class that was fixed in the Business Tool bridge.

**Fix:** adapter ownership is now `explicit root || #km-business` only. Generic shared workspace containers are no longer valid Business mount targets.

### P1 — Business Studio had an independent entitlement implementation

`kleenest-business-gap-closer-v2.js` presents a second Business Studio feature catalog and previously gated advanced cards by tier without enforcing the canonical advanced-role contract at the presentation layer.

**Fix:** added `kleenest-business-studio-entitlement-guard-v1.js`. It uses the canonical Business feature registry and applies both tier and role restrictions to the Studio feature catalog.

### P2 — Canonical Business feature contract was not exposed to compatibility UI layers

The runtime bridge exposed CRUD/value cores but not the registry itself, encouraging compatibility layers to duplicate tier rules.

**Fix:** runtime bridge now exposes `feature`, `featureAccess`, and `features` from `business-feature-registry.js` while preserving server-side CRUD authorization as authoritative.

## QR authorization verification

Live Supabase inspection confirmed `business_create_custom_qr` and `business_update_custom_qr` are SECURITY DEFINER functions that require business management access, require Growth/Enterprise access, and verify the QR location belongs to the requested business before mutation. No database bypass was introduced by the Business Studio QR path.

## Files changed

- `cores/business/business-runtime-bridge-v1.js`
- `kleenest-business-feature-entitlement-enforcer-v1.js`
- `kleenest-business-workspace-adapter-v1.js`
- `kleenest-business-studio-entitlement-guard-v1.js`

## Verification

- Confirmed authoritative branch head before changes.
- Inspected Business feature registry and canonical CRUD core.
- Inspected Business Tool bridge and identified stable dataset keys.
- Inspected Business workspace adapter and removed shared-container fallback.
- Inspected Business Studio and identified independent entitlement catalog.
- Inspected live Supabase QR SECURITY DEFINER functions and confirmed business/plan/location authorization.
- Committed all source hardening to the authoritative branch.

## Remaining runtime gates

- Authenticate with Standard, Growth, and Enterprise business accounts and exercise each Business surface.
- Verify owner/admin/manager versus analyst/member presentation and mutation behavior.
- Navigate Business → Home/Maps/Social/Profile/Admin and confirm no Business DOM remains outside `#km-business`.
- Exercise Promotion/Event/Campaign/Contest/QR/Partner CRUD create → refresh → update → delete.
- Verify Pages deployment serves the latest authoritative commit and perform device/browser regression checks.
