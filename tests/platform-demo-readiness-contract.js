/* Web/demo/mobile readiness contract. */
'use strict';
const fs=require('fs');
const p=fs.readFileSync('kleenest-platform-adapter.js','utf8');
const d=fs.readFileSync('kleenest-demo-environment.js','utf8');
for(const n of ['platform','isNative','navigate','activity','reward','storage','demo','capabilities'])if(!new RegExp(`P\\.${n}\\s*=`).test(p))throw new Error(`Missing platform boundary: ${n}`);
for(const n of ['enable','disable','enabled','snapshot','guardProductionWrite'])if(!new RegExp(`D\\.${n}\\s*=`).test(d))throw new Error(`Missing demo boundary: ${n}`);
for(const s of ['Home','Maps','Route','Details','Social','Profile','Business','Enterprise','Admin'])if(!d.includes(`'${s}'`))throw new Error(`Missing demo surface: ${s}`);
console.log('Platform/demo readiness contract passed.');
