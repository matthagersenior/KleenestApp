# Canonical application source

`refactor/monolith-removal` is the canonical Kleenest application source for all ongoing web-app development, feature work, migrations, fixes, and releases.

## Rules

- New application work goes to `refactor/monolith-removal`.
- Missing modules, data contracts, migrations, UI paths, and backend functions are created on this branch rather than treating absence as a blocker.
- `main` is not the development source of truth.
- Production/Pages publishing should consume the verified refactor branch.
- Business advanced datasets are expected to support CRUD for campaigns, events, photos/media, and partnerships.
- Location occupancy is amenity-aware and incorporates stalls, urinals, sinks, changing tables, showers, and registered amenities in capacity calculations.
