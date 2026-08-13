/* Ensure the high-value social/gamification feature layer is actually wired into the modular loader. */
'use strict';
const fs=require('fs');
const loader=fs.readFileSync('kleenest-ui-integration.js','utf8');
for(const asset of ['kleenest-gamification.js','kleenest-social.js','kleenest-community-ui.js'])if(!loader.includes(asset))throw new Error(`Feature UI asset not wired: ${asset}`);
for(const api of ['loadGamification','loadCommunity'])if(!loader.includes(`KleenestUI.${api}`))throw new Error(`Feature UI bridge missing ${api}`);
for(const file of ['kleenest-gamification.js','kleenest-social.js','kleenest-community-ui.js'])if(fs.statSync(file).size<500)throw new Error(`Feature UI layer unexpectedly small: ${file}`);
console.log('Feature UI integration contract passed.');
