# Legacy Monolith Baseline

This branch is the preserved working reference for the original Kleenest single-file application during the modular migration.

## Baseline characteristics

- Single `index.html` application with embedded UI, state, and handlers.
- LocalStorage-backed demo data under the legacy `kleenest-db-v11` key.
- Legacy demo accounts and quick-login flows.
- Legacy auth modal and form handlers.
- Supabase runtime scripts may be loaded alongside the monolith during migration.

## Purpose

Use this branch to reproduce legacy behavior and compare it with the modular implementation. It is not the production security or data authority.

## Regression rule

A modular feature is considered behaviorally migrated only after its workflow can be exercised against the same user-visible scenario represented by this baseline. Differences should be intentional and documented.

## Security rule

Never reuse legacy demo credentials or localStorage state as production authentication or authorization.
