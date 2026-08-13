# Kleenest Demo / Reference App

This branch, `demo/legacy-monolith`, preserves the full monolithic application entrypoint from the refactor baseline as a working reference/demo environment.

## Purpose

- Compare behavior against the modular production app.
- Reproduce legacy workflows while migrating features.
- Preserve a known-working visual/interaction reference.
- Stress-test changes without making the monolith the permanent production architecture.

## Important

The monolith contains legacy/local demo authentication and local data behavior. It is **not** the production authentication or data authority. Never put real credentials in this branch.

## Graduation rule

Once the modular app passes feature-parity acceptance and the exhaustive stress/regression suite, production `index.html` can become modular while this branch remains available as the regression/reference environment.
