# Legacy Monolith Baseline

The current `index.html` pulled from `refactor/monolith-removal` is a working demo/reference implementation, not the target production architecture.

## Observed baseline

- Single-file HTML application with embedded CSS and JavaScript.
- LocalStorage-backed `kleenest-db-v11` demo database.
- Local demo sessions and hardcoded demo credentials.
- Legacy login, signup, and business-signup event handlers.
- Leaflet loaded from CDN for the map.
- Core demo flows represented in the monolith: user browsing, map/details, check-in, profile, business view, admin view, and demo reset.
- Modal backdrop handling has an explicit target check to avoid closing the modal when interacting with form controls.

## Migration rule

This file is a reference baseline only. Production promotion requires the modular app to replace the local database/session/auth behavior and pass the production-index boundary test, modular parity checks, security/RLS checks, browser/device integration tests, and the exhaustive stress suite.

## Security rule

Never ship the monolith's demo credentials or localStorage database as production authentication/data authority.
