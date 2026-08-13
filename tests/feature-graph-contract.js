/* Cross-surface parity gate: modular domains must expose their relationships and monetization loops. */
'use strict';
const fs=require('fs');
const f=fs.readFileSync('kleenest-feature-graph.js','utf8');
for(const n of ['mapDiscovery','detailsActions','routeActions','communityActions','profileDestinations','businessValue','adminDestinations','premiumValue'])if(!new RegExp(`X\\.${n}\\s*=`).test(f))throw new Error(`Missing feature graph capability: ${n}`);
for(const n of ['community','route','game','contests','partnerships','analytics','enterprise','partnerAccess','likedReviews','family'])if(!f.includes(n))throw new Error(`Missing cross-surface relationship: ${n}`);
console.log('Cross-surface feature graph contract passed.');
