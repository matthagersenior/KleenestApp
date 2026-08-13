/* Static smoke gate for the production modular runtime. */
'use strict';
const fs=require('fs');
const required=['kleenest-events.js','kleenest-navigation.js','kleenest-surface-actions.js','kleenest-platform-adapter.js','kleenest-demo-environment.js','kleenest-premium-engagement.js','kleenest-enterprise-partner-intelligence.js','kleenest-partner-campaigns.js','kleenest-partner-allocation.js'];
const f=fs.readFileSync('kleenest-ui-integration.js','utf8');
for(const x of required)if(!f.includes(x))throw new Error(`Runtime missing ${x}`);
if(!f.includes('installModalInteractionGuard'))throw new Error('Modal guard missing');
console.log('Web/native/demo smoke gate passed.');
