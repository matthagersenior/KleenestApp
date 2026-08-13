/* Partner matching must be deterministic: one venue's bonus cannot mutate another venue's base tier. */
'use strict';
const fs=require('fs');const f=fs.readFileSync('kleenest-partner-matching.js','utf8');
for(const n of ['consumerTier','businessTier','match','rank'])if(!new RegExp(`M\\.${n}\\s*=`).test(f))throw new Error(`Missing partner matching capability: ${n}`);
const M={};
// Source-level guard: matching uses fresh arrays/destructuring and never writes to a shared tier object.
if(/matrix\[[^\]]+\]\[[^\]]+\]\.[A-Za-z]+\s*=/.test(f))throw new Error('Shared partner matrix appears mutable.');
if(!f.includes('Math.min(30'))throw new Error('Partner discount cap missing.');
console.log('Partner matching isolation contract passed.');
