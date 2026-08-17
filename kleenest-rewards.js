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
  function publish(kind,result,session){
    const user=applyProfile(result?.profile||{},session);
    const detail={profile:user,transactions:result?.point_transactions||[],newBadges:result?.new_badges||[],badges:result?.badges||[],checkIn:result?.check_in||null,review:result?.review||null,redemption:result?.redemption||null,promotion:result?.promotion||null};
    window.dispatchEvent(new CustomEvent('kleenest:rewards-updated',{detail}));
    window.dispatchEvent(new CustomEvent('kleenest:'+kind+'-rewards-updated',{detail}));
    return result;
  }
  async function session(){if(!window.KleenestSupabase?.client)throw new Error('Supabase is not ready.');const s=await window.KleenestSupabase.session();if(!s)throw new Error('Please sign in to continue.');return s;}
  window.KleenestRewards.lastCheckIn=function(){try{return JSON.parse(sessionStorage.getItem('kleenest:last-checkin')||'null');}catch(_){return null;}};
  window.KleenestRewards.award=async function(points,kind,reference){
    const s=await session();
    const action=kind==='game'?'game_play':String(kind||'game_play');
    const {data,error}=await window.KleenestSupabase.client().rpc('record_progression_action',{p_action:action,p_reference_id:null});
    if(error)throw error;
    const result=data||{};
    return publish('game',result,s);
  };
  window.KleenestRewards.syncCheckin=async function(checkinId){
    if(!checkinId)throw new Error('A check-in ID is required.');const s=await session();
    const {data,error}=await window.KleenestSupabase.client().rpc('checkin_rewards_summary',{p_checkin_id:checkinId});if(error)throw error;
    const result=data||{},checkIn=result.check_in||{id:checkinId};try{sessionStorage.setItem('kleenest:last-checkin',JSON.stringify(checkIn));}catch(_){}
    return publish('checkin',result,s);
  };
  window.KleenestRewards.syncReview=async function(reviewId){
    if(!reviewId)throw new Error('A review ID is required.');const s=await session();
    const {data,error}=await window.KleenestSupabase.client().rpc('review_rewards_summary',{p_review_id:reviewId});if(error)throw error;
    return publish('review',data||{},s);
  };
  window.KleenestRewards.syncPromotionRedemption=async function(redemptionId){
    if(!redemptionId)throw new Error('A redemption ID is required.');const s=await session();
    const {data,error}=await window.KleenestSupabase.client().rpc('promotion_redemption_rewards_summary',{p_redemption_id:redemptionId});if(error)throw error;
    return publish('promotion',data||{},s);
  };
})();