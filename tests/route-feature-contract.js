/* Route feature contract: navigation must remain a first-class modular, gamified domain. */
'use strict';
const fs=require('fs');
const route=fs.readFileSync('kleenest-route.js','utf8');
const runtime=fs.readFileSync('kleenest-supabase-runtime.js','utf8');
const required=['KleenestRoute','create_route_plan','complete_route','pointsPreview','renderRouteCard','scoreRoute'];
for(const token of required){if(!route.includes(token))throw new Error(`Route contract missing ${token}`);}
if(!runtime.includes("'kleenest-route.js'"))throw new Error('Route module is not loaded by modular runtime.');
console.log('Route feature contract passed.');
