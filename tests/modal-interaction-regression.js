/* Regression contract for the modal click-through dismissal bug. */
'use strict';
const fs=require('fs');
const g=fs.readFileSync('kleenest-modal-interaction-guard.js','utf8');
if(!g.includes("e.target===overlay"))throw new Error('Backdrop-only close rule missing');
if(!g.includes("!explicit.classList.contains('modal-overlay')"))throw new Error('Overlay close-control exclusion missing');
for(const type of ['click','pointerdown','mousedown'])if(!g.includes(`addEventListener('${type}'`))throw new Error(`Missing ${type} protection`);
for(const f of ['kleenest-ui-integration.js']){if(!fs.existsSync(f))throw new Error(`Missing integration file ${f}`);}
console.log('Modal interaction regression contract passed.');
