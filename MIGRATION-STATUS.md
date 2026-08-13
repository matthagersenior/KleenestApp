# Modular Migration Status

## Canonical architecture

- Production authority: Supabase authentication/data/RPC layer.
- Production UI target: modular runtime.
- Reference implementation: restored monolithic application.
- Promotion rule: modular runtime must pass parity and P0 stress gates before replacing the monolith as production entry.

## Verified contracts

- Authentication and session synchronization are centralized in `kleenest-supabase-runtime.js`.
- Auth token/session persistence through localStorage/sessionStorage is prohibited by CI contract tests.
- Legacy auth handlers are guarded so they cannot compete with the Supabase runtime.
- Auth modal touch/pointer behavior has regression coverage.
- Account deletion is authenticated and server-side through `request_account_deletion()`.
- PWA/service-worker behavior has static safety checks.
- Modular workflow and backend contracts have parity checks.
- Modular gamification domain now covers points, levels, badges, streaks, contests and leaderboards.
- Modular social domain now covers favorites, family members, following/followers and liked reviews.
- Modular Community orchestration covers feed, trending, leaderboard, contests and profile summaries.
- Home, Maps, Details, Profile, Business, Admin and Community are declared as modular application surfaces.
- Business verification state/tier has a server-side model and administrator-only write boundary.

## Feature-completion foundation added

- `kleenest-gamification.js`
- `kleenest-social.js`
- `kleenest-community.js`
- `kleenest-app-surfaces.js`
- Gamification/social database migrations and RPCs under `supabase/migrations/20260813*.sql`.
- Server-authoritative contest scoring and automatic streak rewards.
- Feature-completion and schema contract tests.

These migrations are **not claimed as applied to a live Supabase project** until a verified project target is available. Repository integration and CI contracts are in place.

## Remaining promotion gates

1. Apply and validate the new Supabase migrations against the real project.
2. Wire the new social/gamification UI controls into each modular surface.
3. Browser-level integration tests against the real UI.
4. Cross-account/RLS/RPC adversarial testing.
5. Full business/partnership/Preferred workflow parity execution.
6. Physical Android/iOS interaction testing.
7. Full P0/P1 stress matrix execution.
8. Resolve all P0/high-severity findings and retest.
9. Promote modular entrypoint.
10. Retain monolith as regression/demo reference.