# P0 — Canonical Core Restoration

## Finding
The previous shell was itself a fallback implementation. It replaced the feature-rich Home, Community and Profile surfaces with simplified shell-owned markup and routed Maps to the historical `kleenest-maps-canonical-v7.js` renderer. This created the exact symptoms observed on mobile: reduced feature sets, legacy Maps controls/layout, empty results, and inconsistent surfaces.

## Fix
- v73 is now the sole active shell on `refactor/monolith-removal`.
- Home remains product-focused but no longer claims to replace the underlying feature cores.
- Community now mounts `cores/social/social-core-v2.js` directly.
- Maps now mounts `cores/maps/maps-core.js` with the modular renderer, GPS, cache, discovery and location-details modules.
- Profile uses the canonical Account data layer rather than displaying the raw account UUID.
- Legacy Maps preloader/mount guard and historical v7 renderer are removed from the active index bootstrap.
- Existing Maps CSS provides constrained mobile map geometry.
- Dataset/location selection resolves through the canonical `get_location_details` RPC.

## Verification target
Cold load -> Home -> Find a restroom -> canonical Maps -> GPS/discovery -> location list/markers -> select any location -> details -> logout/login -> repeat.

`main` is reference-only and was not modified.