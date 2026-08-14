/* Map startup regression: known locations must load on startup, Maps open, and location updates. */
'use strict';
const fs=require('fs');
const f=fs.readFileSync('kleenest-map-discovery-bootstrap.js','utf8');
for(const x of ['KleenestSupabase?.nearbyLocations','loadRestroomsForLocation','kleenest:location-updated','kleenest:navigation-changed','maps-open','kleenest:map-discovery-ready'])if(!f.includes(x))throw new Error(`Map discovery contract missing: ${x}`);
if(!f.includes('50000,200'))throw new Error('Startup discovery radius/result budget is too small or missing.');
if(!f.includes('merge(rows)'))throw new Error('Discovered locations are not merged into map state.');
console.log('Map discovery bootstrap contract passed.');
