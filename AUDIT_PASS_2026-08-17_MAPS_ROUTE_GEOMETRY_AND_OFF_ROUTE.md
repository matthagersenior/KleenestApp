# Audit Pass — Maps Route Geometry + Off-Route State — 2026-08-17

## Result

The active route provider returns GeoJSON route geometry and turn-by-turn steps. The route core now passes the authoritative preview result directly into the Navigation Core through `navigation.setRouteData(result)`.

Navigation now derives an actual off-route state from that route geometry. It computes the shortest point-to-route-segment distance using a local projected-meter approximation and compares it with the explicit `offRouteThresholdMeters` (default 75 m).

The navigation state now includes:
- `routeDistanceMeters`
- `offRoute`
- existing maneuver/arrival/completion state

The presentation layer now consumes the verified `offRoute` state and displays `Off route`. It does not claim rerouting because no active rerouting producer exists.

## Important boundary

This pass does not invent automatic rerouting. Off-route detection is real and geometry-backed; rerouting remains unimplemented until a verified routing-refresh consumer is established.

## Existing completion safeguards retained

Stop completion still advances only after authoritative persistence succeeds. Route completion failure still leaves navigation active and reports `routeCompletionFailed`.

## Files

- `cores/maps/maps-routes.js`
- `cores/maps/maps-navigation.js`
- `cores/maps/maps-navigation-ui.js`

## Commits

- `9112587c5cffd9bb7d4fd5f30b6d46ab87764dac`
- `45a90ecb60aba1a1b63ef9ab6cdff7c6bbb1dbb7`
- `55516d9e6e8514290dad654db0399056f6404477`

## Verification limitation

Browser execution against the deployed Pages bundle remains the final runtime gate. No automatic rerouting success is claimed.
