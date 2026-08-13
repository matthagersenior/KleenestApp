/* Native/demo safety gate. */
'use strict';
const fs=require('fs');
const p=fs.readFileSync('kleenest-platform-adapter.js','utf8');
const d=fs.readFileSync('kleenest-demo-environment.js','utf8');
for(const x of ['P.platform','P.isNative','P.navigate','P.activity','P.reward','P.storage','P.demo','P.capabilities'])if(!p.includes(x))throw new Error(`Platform boundary incomplete: ${x}`);
for(const x of ['D.enable','D.disable','D.enabled','D.snapshot','D.guardProductionWrite'])if(!d.includes(x))throw new Error(`Demo boundary incomplete: ${x}`);
if(!d.includes('production:write')||!d.includes('production:delete'))throw new Error('Demo production-write guard missing');
console.log('Native/demo safety gate passed.');
