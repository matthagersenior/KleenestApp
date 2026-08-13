/* Legacy partnership parity: Premium/Fleet/Enterprise matching, Growth+ sellers, universal free purchasing. */
'use strict';
const fs=require('fs');
const p=fs.readFileSync('kleenest-partnership-access.js','utf8');
const a=fs.readFileSync('kleenest-single-use-access.js','utf8');
for(const n of ['consumerTier','businessTier','eligibility','getOffers','purchase','redeem','createOffer','rewardRedemption'])if(!new RegExp(`P\\.${n}\\s*=`).test(p))throw new Error(`Missing partnership capability: ${n}`);
if(!a.includes('get_single_use_access_offers')||!a.includes('purchase_single_use_access')||!a.includes('redeem_single_use_access'))throw new Error('Single-use access backend boundary missing.');
if(!a.includes('Growth')||!a.includes('Enterprise'))throw new Error('Growth+ seller restriction missing.');
console.log('Partnership access parity contract passed.');
