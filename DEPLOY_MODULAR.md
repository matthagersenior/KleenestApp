# Standalone Modular Deployment

## Branch policy
`refactor/monolith-removal` is the standalone modular Kleenest application.

- `main` remains the legacy monolith/reference application.
- Do NOT merge `main` into this branch.
- Do NOT merge this branch into `main`.
- Do NOT use `main/index.html` to debug the modular application.
- All new application work belongs on `refactor/monolith-removal` unless explicitly requested otherwise.

## Production entrypoint
The application entrypoint on this branch is this branch's `index.html`. It is intentionally a small modular shell that loads:

1. `kleenest-modular-feature-registry.js`
2. `kleenest-modular-entry.js`

The monolithic implementation is not part of the modular runtime.

## Deployment requirement
The hosting/deployment configuration must publish the contents of `refactor/monolith-removal` as the site root. A deployment that publishes `main` is serving the wrong application, even if the repository is correct.

The modular build should expose a simple runtime marker so browser testing can verify the correct entrypoint. Do not use branch merging as a deployment mechanism.

## Maps policy
Maps is a modular surface. GPS, discovery, caching, verification, gamification and social integrations must remain modular and must not be copied back into the monolith.
