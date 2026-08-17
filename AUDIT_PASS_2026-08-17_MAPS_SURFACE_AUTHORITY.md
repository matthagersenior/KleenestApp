# AUDIT PASS — Maps Surface Authority Consolidation

Date: 2026-08-17
Branch: refactor/monolith-removal

## Found
The active Maps tab mounted multiple presentation enhancers after Maps Core. The legacy dashboard path duplicated controls, legend, filters, route UI, and a fixed navigation panel. The canonical Maps Core also mounted its own renderer, controls, route panel, and navigation UI.

## User-visible symptom
Maps could render plain controls/legend/card chrome while Leaflet was not visibly usable, then become unresponsive. The observed controls included Update my location, Center on me, Route planner, and a persistent-looking lower panel.

## Fix
1. Removed the legacy dashboard loader from `kleenest-maps-dashboard-redesign-v3.js`; the v3 enhancer is now lightweight and presentation-only.
2. Removed the Maps Surface Enhancer v4, Maps Verification UI, and Maps Action Capabilities UI from the active Maps Tab Core mount path. Those files remain in the repository pending consumer audit; they are not deleted blindly.
3. Cache-busted the active Maps Tab Core to `maps-core=13` and registry `tabcore=24`.
4. Cache-busted the renderer to `maps-renderer=5`.
5. Corrected the Maps position-distance calculation guard so longitude delta is calculated from the two positions.
6. Navigation UI remains available to the canonical Core but only renders navigation state when navigation is active. Free users no longer receive an empty route panel during entitlement hydration.

## Authority after fix
Maps Tab Core → Maps Core → Maps Renderer + Maps Core controls.

Optional legacy/presentation enhancers are not part of the critical Maps mount lifecycle.

## Verification boundary
Do not delete legacy enhancer files until repository-wide consumer tracing confirms they have no legitimate non-Maps consumers.

## Next
Fresh deployment test: open Home, manually open Maps, confirm Leaflet canvas initializes before any location/discovery work, then test Update my location and Route planner independently.