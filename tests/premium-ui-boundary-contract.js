/* Premium UI must expose lifetime purchase semantics only. */
'use strict';
const fs=require('fs');
const f=fs.readFileSync('kleenest-premium-ui.js','utf8');
for(const token of ['kleenest_premium_lifetime','one_time','purchase','restore','renewable:false','adsEnabled:true'])if(!f.includes(token))throw new Error(`Missing Premium UI contract: ${token}`);
if(/monthly|yearly|subscription|recurring/i.test(f))throw new Error('Recurring Premium language detected');
console.log('Premium UI boundary contract passed.');
