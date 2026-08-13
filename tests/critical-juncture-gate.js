/* Critical-juncture gate: modular production, demo, native, parity, and runtime readiness. */
'use strict';
const fs=require('fs');
const requiredFiles=['index.html','kleenest-views.js','kleenest-ui-integration.js','kleenest-navigation.js','kleenest-surface-actions.js','kleenest-platform-adapter.js','kleenest-demo-environment.js','kleenest-app-bootstrap.js','manifest.webmanifest','sw.js'];
for(const f of requiredFiles)if(!fs.existsSync(f))throw new Error(`Missing required artifact: ${f}`);
const runtime=fs.readFileSync('kleenest-ui-integration.js','utf8');
for(const f of ['kleenest-views.js','kleenest-navigation.js','kleenest-surface-actions.js','kleenest-platform-adapter.js','kleenest-demo-environment.js','kleenest-app-bootstrap.js'])if(!runtime.includes(f))throw new Error(`Runtime not wired: ${f}`);
const index=fs.readFileSync('index.html','utf8');
if(index.includes('/* ========== VIEWS ========== */'))throw new Error('VIEWS block still embedded in index');
if(!index.includes('kleenest-views.js'))throw new Error('Views loader missing');
const nav=fs.readFileSync('kleenest-navigation.js','utf8');
for(const s of ['Home','Maps','Route','Details','Social','Profile','Business','Enterprise','Admin'])if(!nav.includes(s))throw new Error(`Surface missing: ${s}`);
const demo=fs.readFileSync('kleenest-demo-environment.js','utf8');
for(const s of ['Home','Maps','Route','Details','Social','Profile','Business','Enterprise','Admin'])if(!demo.includes(s))throw new Error(`Demo surface missing: ${s}`);
for(const f of ['kleenest-views.js','kleenest-navigation.js','kleenest-surface-actions.js','kleenest-platform-adapter.js','kleenest-demo-environment.js'])if(!fs.readFileSync(f,'utf8').trim())throw new Error(`Empty modular artifact: ${f}`);
if(!runtime.includes('installModalInteractionGuard'))throw new Error('Modal protection missing');
console.log('Critical-juncture gate passed.');
