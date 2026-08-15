# Modular Recovery Note

## Current mission
Keep `refactor/monolith-removal` as the only production runtime. Do not restore the monolithic renderer.

## What we are doing
Recover and wire the richest existing extracted modular features from repository history/branches into one stable shell, without eager-loading unstable modules.

## Feature sources already identified
- `f219de80` — advanced QR + business CRUD controls (`kleenest-business-advanced-controls.js`)
- `636fe781` — authoritative Business workspace + analytics
- `c6f9a625` — modular Game Center
- `b3673dc` — Social + Media services
- `cb024e8c` — centralized account/business data modules
- `1c70c6c` — extracted navigation controller
- `c12b3aa` — notification UI controller
- `6461875b` — extracted Business renderer
- `9f03f53` — extracted Business action layer
- `ef99c58` — centralized Rewards loading

## Rules for future passes
1. Inspect existing modular feature files/commits before recreating functionality.
2. Wire modules through a single loader owned by the modular shell.
3. Lazy-load heavy feature modules when their surface is opened.
4. Never load the monolithic renderer.
5. Never use MutationObserver/timer polling for shell navigation.
6. Preserve auth, QR, CRUD, analytics, social, games, media/VR, partnerships, amenities, locations, promos, campaigns, events, reviews and occupancy calculations.
7. Business advanced controls (QR Studio, detailed analytics, campaigns/promos/offers and advanced CRUD) remain Growth+ and owner/admin gated; Standard retains basic overview statistics.
8. Location amenities must align with premium search filters and feedback must capture good/needs-attention amenities.
9. Occupancy must use fixture/amenity inputs including stalls, urinals, sinks, etc.
10. Photos/media must be size-aware; authorized businesses can upload images and VR/360 media.
11. App branding is always `Kleenest`; never `KKleenest` or `Cleanest` in displayed app copy.
12. After each substantial change, inspect the resulting files/commits before claiming the feature is wired.

## Immediate next work
Replace the temporary minimal shell with a stable lazy module registry. First wire navigation + auth launcher, then Maps/location, Social/Games/Rewards, QR, Business/Analytics/CRUD, Admin, and Media/Partnerships. Verify each surface can load without startup stalls.
