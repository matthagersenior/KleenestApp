/* Cross-surface completeness contract: one shared activity vocabulary and explicit feature handoffs. */
(function(){'use strict';
 const S=window.KleenestSurfaceContract=window.KleenestSurfaceContract||{};
 S.surfaces={Home:['discovery','daily_quests','streaks','leaderboards','contests'],Maps:['discovery','favorites','check_ins','route_start','partner_access'],Route:['route_challenges','completion_rewards','team_goals','sharing'],Details:['reviews','favorites','liked_reviews','partner_access','business_growth'],Social:['following','followers','contests','helpful_reviews','leaderboards'],Profile:['levels','points','badges','streaks','family','favorites','following'],Business:['verification','tier','growth','campaigns','promotions','partner_access','analytics'],Enterprise:['networks','partner_benchmarking','campaign_roi','allocations','attribution','workforce'],Admin:['verification','moderation','reward_integrity','contest_oversight','analytics']};
 S.activityTypes=['visit','check_in','review','favorite','follow','route_complete','share','contest_entry','access_redemption','promotion_redemption','preferred_use','points_awarded'];
 S.handoffs={Maps:['Details','Route','Profile'],Details:['Maps','Social','Business'],Route:['Maps','Social','Profile'],Social:['Profile','Details','Business'],Profile:['Maps','Route','Social','Family'],Business:['Enterprise','Details','Social','Profile'],Enterprise:['Business','Admin','Social'],Admin:['Business','Enterprise','Social']};
 S.hasSurface=s=>Array.isArray(S.surfaces[s])&&S.surfaces[s].length>0;
 S.validate=()=>Object.keys(S.surfaces).every(S.hasSurface)&&S.activityTypes.length>=10&&Object.keys(S.handoffs).length>=7;
})();
