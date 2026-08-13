/* Every modular product surface must expose the shared social/gamification/game loop. */
'use strict';
const fs=require('fs');
const controllers=fs.readFileSync('kleenest-surface-controllers.js','utf8');
const engagement=fs.readFileSync('kleenest-engagement.js','utf8');
const game=fs.readFileSync('kleenest-game.js','utf8');
const runtime=fs.readFileSync('kleenest-supabase-runtime.js','utf8');
const surfaces=['home','maps','route','details','profile','community','business','admin'];
if(!engagement.includes('getSnapshot')||!engagement.includes('getSummary'))throw new Error('Shared engagement snapshot is incomplete.');
if(!game.includes('QUESTS')||!game.includes('getState')||!game.includes('startQuest'))throw new Error('Modular game loop is incomplete.');
for(const name of surfaces){if(!new RegExp(`C\\.${name}\\s*=`).test(controllers))throw new Error(`Missing surface controller: ${name}`);const start=controllers.indexOf(`C.${name}=`);const end=controllers.indexOf('C.',start+4);const block=controllers.slice(start,end>start?end:start+1600);if(!block.includes('engagement(root'))throw new Error(`Surface ${name} does not mount the shared engagement/game center.`);}
for(const token of ['KleenestGamification','KleenestSocial','KleenestCommunity'])if(!engagement.includes(token))throw new Error(`Engagement layer missing ${token}.`);
if(!runtime.includes("'kleenest-engagement.js'"))throw new Error('Runtime does not load shared engagement layer.');
console.log('Cross-surface engagement contract passed.');