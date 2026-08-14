/* Route planner regression: route choices must be bathroom-aware and selectable. */
'use strict';
const fs=require('fs');
const f=fs.readFileSync('kleenest-route-planner.js','utf8');
const runtime=fs.readFileSync('kleenest-supabase-runtime.js','utf8');
for(const token of ['alternatives=true','nearbyLocations','data-select-route','data-route-stop','recommended','waypointStops','score','is_favorite','cleanliness_pct','review_count'])if(!f.includes(token))throw new Error(`Route planner missing ${token}`);
if(!runtime.includes('kleenest-route-planner.js'))throw new Error('Route planner is not loaded by the modular runtime.');
if(!f.includes('window.routePlan='))throw new Error('Selecting a route must populate the existing route plan.');
console.log('Route planner choice/waypoint contract passed.');
