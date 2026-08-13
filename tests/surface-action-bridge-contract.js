/* Modular surface action bridge regression contract. */
'use strict';
const fs=require('fs');
const f=fs.readFileSync('kleenest-surface-actions.js','utf8');
for(const n of ['openDetails','openMap','openRoute','openProfile','openCommunity','openBusiness','recordActivity','reward','bind'])if(!new RegExp(`S\\.${n}\\s*=`).test(f))throw new Error(`Missing surface action: ${n}`);
for(const token of ['kleenest:details-request','kleenest:route-request','kleenest:profile-request','kleenest:business-request','kleenest:activity'])if(!f.includes(token))throw new Error(`Missing event boundary: ${token}`);
console.log('Surface action bridge contract passed.');
