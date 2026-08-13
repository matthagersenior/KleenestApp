/* Enterprise recommendations must be executable, not dashboard-only. */
'use strict';
const fs=require('fs');
const f=fs.readFileSync('kleenest-partner-allocation.js','utf8');
for(const n of ['create','activate','roi','planFromBenchmark','render'])if(!new RegExp(`A\\.${n}\\s*=`).test(f))throw new Error(`Missing allocation capability: ${n}`);
for(const t of ['single_use_access','promotion','preferred','contest'])if(!f.includes(t))throw new Error(`Missing allocation type: ${t}`);
console.log('Partner allocation contract passed.');
