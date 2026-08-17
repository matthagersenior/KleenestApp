# Audit Pass — Maps Navigation Stop Completion — 2026-08-17

## Finding

GPS arrival marked a route stop as locally completed before the authoritative `routes.completeStop()` mutation succeeded. A transient RLS/network/server failure could therefore permanently skip the stop for the remainder of the navigation session.

## Fix

`maps-navigation.js` now:

1. detects arrival;
2. attempts the existing server-authoritative `completeStop` mutation;
3. only marks the stop locally completed after that mutation succeeds;
4. emits `completionFailed: true` when the mutation fails;
5. leaves the current stop active so the next GPS update retries the mutation.

No new mutation authority or database permission was added.

## Commit

`864558739d65eca42ecd9429e8a64757509bdb5d`

## Verification limitation

Browser execution remains the final runtime gate.
