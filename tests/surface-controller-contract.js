/* Ensure the modular web surfaces have executable controllers, not dependency-only registries. */
'use strict';
const fs=require('fs');
const runtime=fs.readFileSync('kleenest-supabase-runtime.js','utf8');
const surfaces=fs.readFileSync('kleenest-app-surfaces.js','utf8');
const controllers=fs.readFileSync('kleenest-surface-controllers.js','utf8');
for(const name of ['home','profile','community','route']){if(!new RegExp(`C\\.${name}\\s*=`).test(controllers))throw new Error(`Missing modular controller: ${name}`);}
if(!controllers.includes('KleenestCommunity'))throw new Error('Controllers must consume modular community APIs.');
if(!controllers.includes('KleenestGamification'))throw new Error('Controllers must consume modular gamification APIs.');
if(!controllers.includes('KleenestSocial'))throw new Error('Controllers must consume modular social APIs.');
if(!controllers.includes('KleenestRoute'))throw new Error('Controllers must consume modular route APIs.');
for(const name of ['home','maps','details','profile','business','admin','community']){if(!new RegExp(`${name}:\\{`).test(surfaces))throw new Error(`Surface registry missing: ${name}`);}
if(!runtime.includes('kleenest-surface-controllers.js'))throw new Error('Runtime must load surface controllers.');
console.log('Modular surface-controller contract passed.');
