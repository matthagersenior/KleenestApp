# Audit Pass — QR Single-Use Lifecycle and Attribution Fix

**Date:** 2026-08-17
**Branch:** `refactor/monolith-removal`

## Scope

Verified the canonical Business QR implementation and production Supabase contracts before making changes. No placeholder runtime or duplicate QR implementation was introduced.

## Findings

1. The QR editor exposed a Single use control but did not send the value to the QR mutation RPC.
2. Production `qr_codes` already contains `single_use` and `max_redemptions`, and `consume_single_use_qr` already enforces duplicate-redemption protection and automatic deactivation at the redemption limit.
3. QR dashboard attribution totals were filtered by business only and therefore could count attribution events for QR assets outside the currently loaded QR-code set.

## Implementation

- Consolidated `business_create_custom_qr` to accept `p_single_use` and `p_max_redemptions`.
- Consolidated `business_update_custom_qr` to accept the same lifecycle controls.
- Preserved existing business-management and Growth/Enterprise authorization checks.
- Added server-side validation requiring positive redemption limits.
- Ensured `max_redemptions` is persisted only when single-use mode is enabled.
- Restricted the new mutation signatures to authenticated execution.
- Wired the canonical QR Studio editor to persist single-use state and maximum redemptions on create and edit.
- Added persisted lifecycle information to the QR asset display.
- Scoped dashboard attribution events to the business's actual persisted QR-code IDs.
- Added the corresponding Supabase migration to the repository.

## Verification

- Applied the migration to the connected Supabase project.
- Re-read the live function definitions after migration and verified the new signatures are present.
- Re-verified the existing `consume_single_use_qr` redemption implementation, including row locking, duplicate-use prevention, redemption limits, and automatic QR deactivation.
- Verified the active frontend path uses the updated RPC argument names.

## Remaining

Fleet mutation authorization/state-transition verification is next, followed by provenance/evidence integrity and gamification idempotency/cooldown/velocity controls.
