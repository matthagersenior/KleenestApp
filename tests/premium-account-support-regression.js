/* Premium pricing, ad support, account tools, and support regression contract. */
'use strict';
const fs=require('fs');
const p=fs.readFileSync('kleenest-premium-entitlement.js','utf8');
const a=fs.readFileSync('kleenest-consumer-account-tools.js','utf8');
const s=fs.readFileSync('kleenest-support.js','utf8');
if(!p.includes("MODE='one_time'"))throw new Error('Premium must be one-time');
if(!a.includes('PREMIUM_PRICE_USD=5'))throw new Error('Premium price must be $5');
if(!p.includes('free_ad_supported')||!p.includes('adsEnabled'))throw new Error('Free ad-supported state missing');
for(const x of ['requirePremium','changePassword','changeProfilePicture','submitBug','submitSupport','gateContest','gateRewardPromotion'])if(!a.includes(x))throw new Error(`Account feature missing: ${x}`);
for(const x of ['bug','support','feedback'])if(!s.includes(`'${x}'`))throw new Error(`Support type missing: ${x}`);
console.log('Premium/account/support regression contract passed.');
