# Business RPC Authority Audit — 2026-08-17

**Authoritative branch:** `refactor/monolith-removal`

## Live Supabase findings

Inspected the production Business mutation RPC inventory for the canonical workspace and compatibility management layers.

### Confirmed secure paths

The current advanced Business mutation functions for Promotions, Events, Campaigns, Contests, QR, and their delete/update paths enforce authenticated business management plus Growth/Enterprise access where applicable. QR create/update also verifies the requested QR location belongs to the requested business.

### P1 database architecture finding — overloaded legacy RPCs

The live public schema contains multiple overloaded versions of several Business RPC names, including:

- `business_create_location`
- `business_update_location`
- `business_create_promotion`
- `business_set_promotion_active`
- `business_create_event`
- `business_create_partner_program`

Some legacy overloads use older `can_manage_business` / `business_admin_guard` authorization contracts, while newer overloads use the newer `business_can_manage` / `business_advanced_allowed` contract. This creates multiple authorities for the same logical operation and makes client behavior depend on the exact argument signature.

### Concrete client risk found

The legacy `KleenestBusinessManagement` helper calls the two-argument `business_set_promotion_active(p_promotion_id,p_active)` overload, which is an older SECURITY DEFINER path using `business_admin_guard`. The newer three-argument overload is business-scoped and uses `business_admin_allowed`.

The canonical Business Workspace also contains a Partnership create path that calls `business_create_partner_program` with only `p_name`, while the live production overloads require either `(p_business_id,p_name)` or `(p_name,p_partner_business_id)`. This is a functional mismatch and should be routed through the canonical Business CRUD authority rather than the legacy direct-RPC path.

## Action taken in this pass

- No blind database deletion or replacement was performed.
- The duplicate client-side Business CRUD core was removed from the authoritative repository because it was not part of the active modular bootstrap.
- Business feature entitlement presentation was centralized around the canonical registry.
- The RPC overload conflict is logged as a P1 database cleanup task requiring migration-level changes and regression testing.

## Required next implementation pass

1. Consolidate legacy Business RPC overloads into one authoritative signature per operation.
2. Route the canonical Business Workspace CRUD operations through `business-crud-core.js` where the registry supports them.
3. Replace browser `alert/confirm` flows in the Business Workspace with the existing in-app notice/two-step confirmation pattern.
4. Re-run the live function inventory and verify anonymous/authenticated execution privileges after consolidation.
5. Exercise each mutation against live RLS/RPC authorization for Standard, Growth, Enterprise and owner/admin/manager/member/analyst roles.
