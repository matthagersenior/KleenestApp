/* Guards the modular product against feature-silo regressions. */
'use strict';
const fs=require('fs');
const f=fs.readFileSync('kleenest-surface-contract.js','utf8');
for(const s of ['Home','Maps','Route','Details','Social','Profile','Business','Enterprise','Admin'])if(!f.includes(`${s}:`))throw new Error(`Missing surface: ${s}`);
for(const a of ['visit','check_in','review','favorite','follow','route_complete','share','contest_entry','access_redemption','promotion_redemption','preferred_use','points_awarded'])if(!f.includes(`'${a}'`))throw new Error(`Missing shared activity: ${a}`);
if(!f.includes('campaign_roi')||!f.includes('partner_benchmarking')||!f.includes('allocations'))throw new Error('Enterprise growth stack incomplete.');
console.log('Surface completeness contract passed.');
