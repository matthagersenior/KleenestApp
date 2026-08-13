/* Premium is a permanent one-time upgrade; recurring billing is prohibited. */
'use strict';
const fs=require('fs');
const f=fs.readFileSync('kleenest-premium-entitlement.js','utf8');
for(const token of ['PRODUCT_ID','kleenest_premium_lifetime','MODE','one_time','premiumOwnership','lifetime','subscriptionRenewalAt','adsEnabled','purchase','restore','assertNoRenewal'])if(!f.includes(token))throw new Error(`Missing Premium entitlement contract: ${token}`);
if(/monthly|yearly|renew|recurring/i.test(f.replace(/assertNoRenewal[\s\S]*/,'')))throw new Error('Recurring Premium semantics detected');
console.log('Premium one-time entitlement contract passed.');
