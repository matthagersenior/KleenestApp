/* Business revenue surface must expose measurable analytics and growth operations. */
'use strict';
const fs=require('fs');
const bi=fs.readFileSync('kleenest-business-intelligence.js','utf8');
const growth=fs.readFileSync('kleenest-business-growth.js','utf8');
const rel=fs.readFileSync('kleenest-surface-relationships.js','utf8');
for(const name of ['getDashboard','getPreferredAnalytics','getPartnerUsage','getPreferredLocationUsage','getPromotionSummary','getBusinessOverview'])if(!new RegExp(`B\\.${name}\\s*=`).test(bi))throw new Error(`Missing business intelligence: ${name}`);
for(const name of ['createPromotion','setPromotionActive','createLocation','updateLocation','inviteMember','updateMemberRole','removeMember','createPartnerProgram','addProgramLocation','setProgramAccess','activatePreferred','deactivatePreferred'])if(!new RegExp(`G\\.${name}\\s*=`).test(growth))throw new Error(`Missing business growth operation: ${name}`);
for(const name of ['mapsToDetails','detailsToRoute','detailsToCommunity','routeToCommunity','routeToProfile','businessToMaps','businessToCommunity','businessToAdmin','adminToBusiness','profileToRoute'])if(!new RegExp(`R\\.${name}\\s*=`).test(rel))throw new Error(`Missing surface relationship: ${name}`);
console.log('Business growth and cross-surface relationship contract passed.');
