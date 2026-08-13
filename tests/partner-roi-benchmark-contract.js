/* Partner ROI must expose measurable outcomes, ranking and allocation guidance. */
'use strict';
const fs=require('fs');const f=fs.readFileSync('kleenest-partner-roi.js','utf8');
for(const n of ['campaignROI','networkBenchmark','recordOutcome','rankPartners','recommendAllocation','summary'])if(!new RegExp(`R\\.${n}\\s*=`).test(f))throw new Error(`Missing partner ROI capability: ${n}`);
for(const metric of ['visits','checkIns','reviews','preferredUses','accessRedemptions','promotionRedemptions','attributedUsers','pointsAwarded'])if(!f.includes(metric))throw new Error(`Missing ROI metric: ${metric}`);
console.log('Partner ROI benchmark contract passed.');
