/* Lightweight contract gate for the shared flywheel. */
'use strict';
const fs=require('fs');
const f=fs.readFileSync('kleenest-flywheel-core.js','utf8');
const p=fs.readFileSync('kleenest-business-flywheel-pricing.js','utf8');
const l=fs.readFileSync('kleenest-local-flywheel.js','utf8');
for(const x of ['check_in','rating','photo_review','promo_view','promo_redeem','preferred_access','owner_claim','verification','owner_response'])if(!f.includes(`'${x}'`))throw new Error(`Missing flywheel event ${x}`);
for(const x of ['qualifiedVisits','promoConversionRate','ratingTrend','partnerROI','repeatVisitRate'])if(!f.includes(`'${x}'`))throw new Error(`Missing metric ${x}`);
if(!p.includes('monthlyUSD:20')||!p.includes('monthlyUSD:50'))throw new Error('Business pricing mismatch');
if(!l.includes('top_rated')||!l.includes('most_improved'))throw new Error('Local ranking primitives missing');
console.log('Flywheel regression contract passed.');
