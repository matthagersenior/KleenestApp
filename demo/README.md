# Kleenest Demo / Reference App

The legacy monolithic UI is retained as a development reference while the modular application reaches feature parity.

## Purpose

- Compare behavior against the modular production app.
- Reproduce legacy workflows while migrating features.
- Provide a stable visual/interaction reference during refactoring.
- Never treat legacy local authentication or local-only state as production authority.

## Graduation rule

When the modular app passes the exhaustive acceptance/stress suite, the legacy implementation can be moved fully behind this demo surface or retained as a development-only artifact. Production `index.html` should remain the modular application entry point after migration.

## Security

Do not place real credentials in this directory. Demo credentials belong in the controlled demo environment, never in source control.
