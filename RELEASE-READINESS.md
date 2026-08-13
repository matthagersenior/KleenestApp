# Kleenest Release Readiness

## Product architecture
- [ ] Modular app is canonical production entry point.
- [x] Legacy implementation has a documented reference/demo role.
- [x] Shared Supabase client is the authentication/data authority.
- [x] Session synchronization is centralized.

## Core product
- [ ] All core user workflows pass acceptance testing.
- [ ] Business workflows pass acceptance testing.
- [ ] Partnership workflows pass acceptance testing.
- [ ] Preferred workflows pass acceptance testing.
- [ ] Account lifecycle passes acceptance testing.

## Security
- [ ] Complete RLS/RPC authorization audit.
- [ ] Cross-account isolation stress test.
- [ ] Role escalation stress test.
- [ ] Production redirect/config audit.

## Mobile/store
- [x] PWA manifest and app shell exist.
- [x] Capacitor configuration exists.
- [ ] Final icons/splash assets.
- [ ] Android signed release build.
- [ ] iOS signed release build.
- [ ] Camera/location permission declarations.
- [ ] Deep-link/auth callback testing.
- [ ] Store metadata/privacy declarations.

## Quality
- [x] JavaScript syntax CI gate.
- [ ] Automated integration/acceptance suite.
- [ ] Exhaustive stress test.
- [ ] Full regression against reference demo.
- [ ] Physical-device test pass.

## Release rule

Do not call the application release-ready until every unchecked item above is either completed or explicitly documented as not applicable, and all critical/high severity stress-test findings are resolved and retested.
