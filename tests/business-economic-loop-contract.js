/* Business monetization contract: consumer engagement must be measurable by business growth tooling. */
'use strict';
const fs=require('fs');
const bi=fs.readFileSync('kleenest-business-intelligence.js','utf8');
const growth=fs.readFileSync('kleenest-business-growth.js','utf8');
for(const metric of ['visits','checkIns','reviews','favorites','followers','promotions','preferredUses','engagementRate','repeatRate','averageRating']) if(!bi.includes(metric)) throw new Error(`Missing business metric: ${metric}`);
for(const action of ['createPromotion','createLocation','inviteMember','createPartnerProgram','activatePreferred','getGrowthSnapshot','getActionPlan']) if(!growth.includes(`G.${action}=`)) throw new Error(`Missing business growth capability: ${action}`);
if(!growth.includes('KleenestBusinessIntelligence')) throw new Error('Growth layer must consume business intelligence.');
console.log('Business economic loop contract passed.');
