/* Verify the database migration contains the complete user-facing gamification/social foundation. */
'use strict';
const fs=require('fs');
const schema=fs.readFileSync('supabase/migrations/20260813000100_gamification_social.sql','utf8');
const rpc=fs.readFileSync('supabase/migrations/20260813000200_gamification_social_rpc.sql','utf8');
for(const table of ['user_favorites','user_follows','family_members','review_likes','points_ledger','gamification_badges','user_badges','user_streaks','contests','contest_entries'])if(!schema.includes(`create table if not exists public.${table}`))throw new Error(`Gamification/social table missing: ${table}`);
for(const fn of ['get_gamification_profile','get_gamification_leaderboard','get_gamification_badges','get_user_badges','get_user_streak','award_gamification_points','record_gamification_activity','get_points_history','get_contests','join_contest','submit_contest_entry','get_contest_leaderboard','list_user_favorites','add_user_favorite','remove_user_favorite','list_following','list_followers','follow_user','unfollow_user','list_liked_reviews','like_review','unlike_review','list_family_members','add_family_member','update_family_member','remove_family_member'])if(!rpc.includes(`function public.${fn}`))throw new Error(`RPC missing: ${fn}`);
if(!schema.includes('enable row level security'))throw new Error('RLS foundation missing.');
if(!rpc.includes('security definer'))throw new Error('Server-authoritative RPCs missing security definer.');
console.log('Gamification/social schema contract passed.');
