/* Fleet/Enterprise contract: the monetization-critical business surface must consume operations + intelligence. */
'use strict';
const fs=require('fs');
const files=['kleenest-enterprise.js','kleenest-business-intelligence.js','kleenest-business-growth.js','kleenest-business-surface.js'];
for(const f of files)if(!fs.existsSync(f))throw new Error(`Missing enterprise module: ${f}`);
const e=fs.readFileSync('kleenest-enterprise.js','utf8');
for(const name of ['getDashboard','getMembers','getLocations','getPrograms','inviteMember','updateMemberRole','removeMember','snapshot','render'])if(!new RegExp(`E\\.${name}\\s*=`).test(e))throw new Error(`Missing enterprise capability: ${name}`);
if(!e.includes('KleenestBusinessIntelligence'))throw new Error('Enterprise must consume business intelligence.');
if(!e.includes('preferredUses')||!e.includes('promotions'))throw new Error('Enterprise must expose growth metrics.');
console.log('Enterprise growth contract passed.');
