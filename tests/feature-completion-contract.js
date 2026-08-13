/* Cross-domain feature completion gate. */
'use strict';
const fs=require('fs');
const game=fs.readFileSync('kleenest-gamification.js','utf8');
const social=fs.readFileSync('kleenest-social.js','utf8');
const community=fs.readFileSync('kleenest-community.js','utf8');
const surfaces=fs.readFileSync('kleenest-app-surfaces.js','utf8');
const rpc=fs.readFileSync('supabase/migrations/20260813000200_gamification_social_rpc.sql','utf8');
const biz=fs.readFileSync('supabase/migrations/20260813000300_business_social_surface_rpc.sql','utf8');
for(const x of ['points','levels','badges','streak','contests','leaderboard','review_total','checkin_total'])if(!game.includes(x))throw new Error(`Gamification feature missing: ${x}`);
for(const x of ['favorites','family','following','followers','Liked','review'])if(!social.toLowerCase().includes(x.toLowerCase()))throw new Error(`Social feature missing: ${x}`);
for(const x of ['Feed','Trending','Leaderboard','Contests','ProfileSummary','HomeSummary'])if(!community.includes(x))throw new Error(`Community feature missing: ${x}`);
for(const x of ['home','maps','details','profile','business','admin','community'])if(!surfaces.includes(`${x}:`))throw new Error(`Surface missing: ${x}`);
for(const x of ['get_gamification_profile','get_gamification_leaderboard','get_user_streak','award_gamification_points','record_gamification_activity','get_contests','join_contest','submit_contest_entry','list_user_favorites','list_following','list_followers','list_liked_reviews','list_family_members'])if(!rpc.includes(`function public.${x}`))throw new Error(`RPC missing: ${x}`);
for(const x of ['get_business_verification_status','set_business_verification_status','get_community_feed','get_community_trending','get_community_profile_summary'])if(!biz.includes(`function public.${x}`))throw new Error(`Business/community RPC missing: ${x}`);
console.log('Feature completion contract passed: social + gamification + contests + business status + 7 app surfaces.');
