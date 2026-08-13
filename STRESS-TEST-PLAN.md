# Kleenest Exhaustive Stress Test Plan

## 1. Authentication
- Login, signup, logout, refresh, expired session, duplicate taps, invalid credentials, confirmation-required signup.
- Verify legacy handlers never compete with Supabase.

## 2. Roles and isolation
- User, business, partner, program member, admin/demo roles.
- Attempt cross-account reads/writes and unauthorized RPC calls.

## 3. Core workflows
- Businesses, locations, check-ins, reviews, replies, promotions, notifications.
- Empty, loading, success, failure, retry, duplicate-submit, and stale-data states.

## 4. Partnerships
- Create program, request agreement, accept agreement, add/remove locations, add/revoke members, access controls, invalid transitions, duplicate operations.

## 5. Preferred
- Eligibility, activation, use, repeated use, inactive program, unauthorized location, tier restrictions, missing partner scope.

## 6. Account lifecycle
- Profile provisioning, business provisioning, deletion request, duplicate deletion request, logout, post-delete session behavior.

## 7. Mobile interaction
- Tap, double tap, long press, keyboard focus, modal dismissal, scrolling, orientation, small screens, safe-area overlap, back navigation.

## 8. Network resilience
- Offline startup, reconnect, slow requests, dropped requests, API errors, auth refresh failure, service-worker fallback.

## 9. Security
- RLS verification, RPC authorization, IDOR attempts, role escalation, malformed input, oversized input, untrusted user content.

## 10. Performance
- Cold startup, repeated navigation, rapid rendering, memory growth, repeated event-handler installation, large lists, repeated RPC calls.

## 11. Packaging
- PWA install, Android Capacitor shell, iOS Capacitor shell, deep links, camera/location permissions, denied permissions, production redirects.

## 12. Regression
- Compare every supported workflow against the legacy reference demo until modular parity is established.

## Exit criteria

A release candidate requires every critical workflow to pass, no unresolved high-severity security/data-isolation issue, no reproducible auth/modal regression, clean CI syntax/asset checks, and a documented retest of every fixed defect.
