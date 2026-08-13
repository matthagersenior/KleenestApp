/* Enterprise partner campaign feature contract. */
'use strict';
const fs=require('fs');
const f=fs.readFileSync('kleenest-partner-campaigns.js','utf8');
for(const n of ['create','activate','pause','recordOutcome','getPerformance','reward','recommend'])if(!new RegExp(`C\\.${n}\\s*=`).test(f))throw new Error(`Missing partner campaign capability: ${n}`);
if(!f.includes('KleenestActionRewards'))throw new Error('Campaign rewards are not connected to engagement rewards.');
console.log('Partner campaign contract passed.');
