/* Ensure the modular product has one reward boundary for every high-value user action. */
'use strict';
const fs=require('fs');
const f=fs.readFileSync('kleenest-action-rewards.js','utf8');
const required=['checkIn','review','helpfulReview','favorite','follow','routeStop','routeComplete','promotion','preferredUse','share','businessEngagement','contestEntry','familyInvite'];
for(const name of required)if(!new RegExp(`R\\.${name}\\s*=`).test(f))throw new Error(`Missing reward adapter: ${name}`);
if(!f.includes('recordActivity'))throw new Error('Reward adapter must use server-authoritative gamification activity.');
console.log('Action reward contract passed.');
