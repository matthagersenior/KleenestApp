/* Critical-juncture gate: modular production, demo, and native readiness. */
'use strict';
const fs=require('fs');
const requiredFiles=['index.html','kleenest-views.js','kleenest-ui-integration.js','kleenest-navigation.js','kleenest-surface-actions.js','kleenest-platform-adapter.js','kleenest-demo-environment.js','manifest.webmanifest','sw.js'];
for(const f of requiredFiles)if(!fs.existsSync(f))throw new Error(`Missing required artifact: ${f}`);
const runtime=fs.readFileSync('kleenest-ui-integration.js','utf8');
for(const f of ['kleenest-views.js','kleenest-navigation.js','kleenest-surface-actions.js','kleenest-platform-adapter.js','kleenest-demo-environment.js'])if(!runtime.includes(f))throw new Error(`Runtime not wired: ${f}`);
const index=fs.readFileSync('index.html','utf8');
if(index.includes('/* ========== VIEWS ========== */'))throw new Error('VIEWS block still embedded in index');
if(!index.includes('kleenest-views.js'))throw new Error('Views loader missing');
for(const f of ['kleenest-views.js','kleenest-navigation.js','kleenest-surface-actions.js','kleenest-platform-adapter.js','kleenest-demo-environment.js']){const s=fs.readFileSync(f,'utf8');if(!s.trim())throw new Error(`Empty modular artifact: ${f}`);}
console.log('Critical-juncture gate passed.');
