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

## Remaining promotion gates

1. Browser-level integration tests against the real UI.
2. Cross-account/RLS/RPC adversarial testing.
3. Full business/partnership/Preferred workflow parity execution.
4. Physical Android/iOS interaction testing.
5. Full P0/P1 stress matrix execution.
6. Resolve all P0/high-severity findings and retest.
7. Promote modular entrypoint.
8. Retain monolith as regression/demo reference.
