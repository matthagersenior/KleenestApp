/* Premium engagement must remain cross-surface and action-oriented. */
'use strict';
const fs=require('fs');const f=fs.readFileSync('kleenest-premium-engagement.js','utf8');
for(const s of ['home','maps','route','details','profile','community','business','admin'])if(!f.includes(`${s}:`))throw new Error(`Missing premium value map: ${s}`);
for(const a of ['checkIn','review','routeComplete','share','contestEntry'])if(!f.includes(`${a}:`))throw new Error(`Missing premium action: ${a}`);
console.log('Premium surface value contract passed.');
