/* Enterprise growth loop regression contract. */
'use strict';
const fs=require('fs');
const f=fs.readFileSync('kleenest-enterprise-growth-loop.js','utf8');
for(const n of ['plan','activate','measure','optimize','render'])if(!new RegExp(`G\\.${n}\\s*=`).test(f))throw new Error(`Missing growth-loop capability: ${n}`);
for(const metric of ['visits','check_ins','reviews','preferred_uses','access_redemptions','promotion_redemptions','points_awarded'])if(!f.includes(`'${metric}'`))throw new Error(`Missing growth metric: ${metric}`);
console.log('Enterprise growth loop contract passed.');
