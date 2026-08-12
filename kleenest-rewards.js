/* Kleenest rewards synchronization layer. */
(function () {
  'use strict';
  window.KleenestRewards = window.KleenestRewards || {};
  function applyProfile(profile, session) {
    const user={id:session.user.id,points:Number(profile?.points||0),level:Number(profile?.level||1),streak:Number(profile?.streak||0),totalCheckIns:Number(profile?.total_check_ins||0),totalReviews:Number(profile?.total_reviews||0),source:'supabase'};
    if(window.KleenestRuntime) window.KleenestRuntime.user=Object.assign({},window.KleenestRuntime.user||{},user);
    if(typeof state!=='undefined'&&state.session) state.session=Object.assign({},state.session,user);
    return user;
  }
  window.KleenestRewards.lastCheckIn=function(){try{return JSON.parse(sessionStorage.getItem('kleenest:last-checkin')||'null');}catch(_){return null;}};
  window.KleenestRewards.syncCheckin=async function(checkinId){
    if(!checkinId)throw new Error('A check-in ID is required.');
    if(!window.KleenestSupabase?.client)throw new Error('Supabase is not ready.');
    const session=await window.KleenestSupabase.session();if(!session)throw new Error('Please sign in to continue.');
    const {data,error}=await window.KleenestSupabase.client().rpc('checkin_rewards_summary',{p_checkin_id:checkinId});if(error)throw error;
    const result=data||{},profile=result.profile||{},checkIn=result.check_in||{id:checkinId};
    try{sessionStorage.setItem('kleenest:last-checkin',JSON.stringify(checkIn));}catch(_){}
    const user=applyProfile(profile,session);
    window.dispatchEvent(new CustomEvent('kleenest:rewards-updated',{detail:{checkIn,profile:user,transactions:result.point_transactions||[],newBadges:result.new_badges||[]}}));
    if(typeof render==='function')render();return result;
  };
  window.KleenestRewards.syncReview=async function(reviewId){
    if(!reviewId)throw new Error('A review ID is required.');
    if(!window.KleenestSupabase?.client)throw new Error('Supabase is not ready.');
    const session=await window.KleenestSupabase.session();if(!session)throw new Error('Please sign in to continue.');
    const {data,error}=await window.KleenestSupabase.client().rpc('review_rewards_summary',{p_review_id:reviewId});if(error)throw error;
    const result=data||{};const user=applyProfile(result.profile||{},session);
    window.dispatchEvent(new CustomEvent('kleenest:review-rewards-updated',{detail:{review:result.review||null,checkIn:result.check_in||null,profile:user,transactions:result.point_transactions||[]}}));
    if(typeof render==='function')render();return result;
  };
})();