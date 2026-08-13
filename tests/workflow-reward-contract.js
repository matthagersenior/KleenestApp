/* Verify high-value workflows have a modular reward path and the live engagement layer can bootstrap it. */
'use strict';
const fs=require('fs');
const engagement=fs.readFileSync('kleenest-engagement.js','utf8');
const rewards=fs.readFileSync('kleenest-action-rewards.js','utf8');
const game=fs.readFileSync('kleenest-game.js','utf8');
const workflows={check_in:['checkIn','check_in'],review:['review','review'],helpful_review:['helpfulReview','community_helpful'],favorite:['favorite','favorite_location'],follow:['follow','follow_user'],route_stop:['routeStop','route_stop_completed'],route_complete:['routeComplete','route_completed'],promotion:['promotion','promotion_redeemed'],preferred_use:['preferredUse','preferred_use'],share:['share','share'],business_engagement:['businessEngagement','business_engagement'],contest_entry:['contestEntry','contest_entry'],family_invite:['familyInvite','family_invite']};
for(const [workflow,[adapter,activity]] of Object.entries(workflows)){if(!rewards.includes(`R.${adapter}=`))throw new Error(`Missing reward adapter for ${workflow}`);if(!rewards.includes(`'${activity}'`))throw new Error(`Missing activity mapping for ${workflow}`);}
if(!engagement.includes("ensure('kleenest-game.js','KleenestGame')"))throw new Error('Engagement layer does not bootstrap the game loop.');
if(!engagement.includes("ensure('kleenest-action-rewards.js','KleenestActionRewards')"))throw new Error('Engagement layer does not bootstrap reward orchestration.');
for(const id of ['daily-discover','daily-review','daily-help','weekly-route','weekly-social'])if(!game.includes(`id:'${id}'`))throw new Error(`Missing quest: ${id}`);
console.log('Workflow reward contract passed.');
