/* Modular social + gamification domain adapter. UI remains replaceable; Supabase is authoritative. */
(function(){'use strict';
 const api=window.KleenestSocialGamification=window.KleenestSocialGamification||{};
 const sb=()=>window.KleenestSupabase;
 const call=(name,args=[])=>{const s=sb(); if(!s||typeof s.rpc!=='function') return Promise.reject(new Error('Supabase facade unavailable')); return s.rpc(name,...args);};
 api.surfaces=['Home','Maps','Details','Profile','Business','Admin','Community'];
 api.features={favorites:true,familyMembers:true,followingFollowers:true,likedReviews:true,badges:true,streaks:true,levels:true,points:true,reviewCheckinTotals:true,businessVerification:true,businessTier:true,contests:true,leaderboards:true,rewards:true};
 api.dashboard=()=>call('gamification_dashboard');
 api.activity=(type,referenceId=null)=>call('record_gamification_activity',[type,referenceId]);
 api.evaluateBadges=()=>call('evaluate_user_badges',[null]);
 api.toggleReviewLike=reviewId=>call('toggle_review_like',[reviewId]);
 api.joinContest=contestId=>call('join_contest',[contestId]);
 api.createContest=(name,description,startsAt,endsAt,rules={},rewards={})=>call('create_contest',[name,description,startsAt,endsAt,rules,rewards]);
 api.contestScore=(contestId,userId)=>call('contest_score',[contestId,userId]);
 api.ready=()=>!!sb();
 api.version='1.0.0';
 window.dispatchEvent(new CustomEvent('kleenest:social-gamification-ready',{detail:api}));
})();
