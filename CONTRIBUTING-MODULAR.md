# Modular change safety contract

## Rules

1. Authentication has a UI-independent controller. Do not put account creation logic in modal click handlers.
2. Modal dismissal must be backdrop-only or explicit-close-only. Interior form controls must never dismiss dialogs.
3. Critical platform services belong in the critical runtime asset list.
4. Every new cross-surface capability gets a small contract/regression test.
5. Supabase authentication/RLS remains authoritative; client UI is never the authorization boundary.
6. Demo/test accounts use real Supabase auth and explicit demo metadata, not a fake authentication path.
7. Before replacing an existing module, fetch the current file and preserve its public API unless intentionally versioning it.
8. Prefer additive modular files over large edits to index.html.
9. After each batch, verify changed files and commit SHA before proceeding.
10. Do not report a feature as complete until its user-visible path and backend path are both connected.
