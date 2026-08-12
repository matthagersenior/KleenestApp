/* Kleenest UI integration bridge. */
(function () {
  'use strict';
  window.KleenestUI=window.KleenestUI||{};
  function emit(name,detail){window.dispatchEvent(new CustomEvent(name,{detail:detail||{}}));}
  function setBusy(el,busy){if(!el)return;el.disabled=!!busy;el.setAttribute('aria-busy',busy?'true':'false');}
  async function run(el,fn){setBusy(el,true);try{return await fn();}catch(error){emit('kleenest:action-error',{action:el?.dataset?.kleenestAction||'',error});throw error;}finally{setBusy(el,false);}}
  async function handle(el){const action=el.dataset.kleenestAction;if(action==='signout')return run(el,()=>KleenestRuntime.signOut());if(action==='notification-read')return run(el,()=>KleenestActions.markNotificationRead(el.dataset.notificationId));if(action==='redeem-promotion')return run(el,()=>KleenestActions.redeemPromotion(el.dataset.promotionId,el.dataset.locationId));if(action==='reply-review')return run(el,()=>KleenestActions.replyToReview(el.dataset.reviewId,el.dataset.reply||''));if(action==='checkin')return run(el,()=>KleenestActions.checkIn(el.dataset.qrCode,Number(el.dataset.latitude),Number(el.dataset.longitude)));}
  document.addEventListener('click',function(event){const el=event.target.closest?.('[data-kleenest-action]');if(el)handle(el).catch(function(){});});
  async function loadRewardsHistory(reason){if(!window.KleenestRewardsHistory?.load||!window.KleenestSupabase?.session)return null;try{const session=await window.KleenestSupabase.session();if(!session)return null;const result=await window.KleenestRewardsHistory.load(50);emit('kleenest:rewards-history-refreshed',{reason:reason||'manual',result});return result;}catch(error){emit('kleenest:action-error',{action:'rewards-history',error});return null;}}
  async function loadAccountState(reason){if(!window.KleenestAccount?.loadState||!window.KleenestSupabase?.session)return null;try{const session=await window.KleenestSupabase.session();if(!session)return null;const result=await window.KleenestAccount.loadState();emit('kleenest:account-state-refreshed',{reason:reason||'manual',result});return result;}catch(error){emit('kleenest:action-error',{action:'account-state',error});return null;}}
  async function refreshLiveState(reason){await Promise.allSettled([loadRewardsHistory(reason),loadAccountState(reason)]);}
  window.KleenestUI.loadRewardsHistory=loadRewardsHistory;
  window.KleenestUI.loadAccountState=loadAccountState;
  window.KleenestUI.refreshLiveState=refreshLiveState;
  window.addEventListener('kleenest:rewards-updated',function(){refreshLiveState('rewards-updated');});
  window.addEventListener('kleenest:auth-ready',function(){refreshLiveState('auth-ready');});
  window.addEventListener('kleenest:auth-state-changed',function(){refreshLiveState('auth-state-changed');});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){refreshLiveState('page-load');});else refreshLiveState('page-load');
  document.addEventListener('click',async function(event){
    const el=event.target.closest?.('[data-checkin]');if(!el||el.dataset.kleenestMigrated==='1'||!window.KleenestRuntime?.supabaseReady?.())return;
    const user=typeof currentUser==='function'?currentUser():null;const location=typeof selected!=='undefined'?selected:null;if(!user||!location?.id)return;
    event.preventDefault();event.stopImmediatePropagation();el.dataset.kleenestMigrated='1';setBusy(el,true);
    try{const pos=await new Promise((resolve,reject)=>{if(!navigator.geolocation)return reject(new Error('Location is required for a live check-in.'));navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,timeout:10000,maximumAge:60000});});const result=await KleenestRuntime.verifyCheckin(location.id,pos.coords.latitude,pos.coords.longitude);if(result?.id)await KleenestRewards.syncCheckin(result.id);emit('kleenest:checkin-live',{result,locationId:location.id});alert('✓ Live check-in confirmed. Your rewards were synchronized from Supabase.');if(typeof render==='function')render();}catch(error){emit('kleenest:action-error',{action:'checkin',error});alert(error?.message||'Live check-in could not be completed.');}finally{el.dataset.kleenestMigrated='0';setBusy(el,false);}
  },true);
  document.addEventListener('click',async function(event){
    const el=event.target.closest?.('[data-submit-review]');if(!el||el.dataset.kleenestMigrated==='1'||!window.KleenestRuntime?.supabaseReady?.()||typeof KleenestReviews?.create!=='function')return;
    const user=typeof currentUser==='function'?currentUser():null;const location=typeof selected!=='undefined'?selected:null;if(!user||!location?.id)return;
    const text=document.getElementById('review-text')?.value?.trim()||'';if(text.length<10)return;const stars=Number(typeof reviewStars!=='undefined'?reviewStars:5);const amenities=[...document.querySelectorAll('.rev-amenity:checked')].map(x=>x.value);
    event.preventDefault();event.stopImmediatePropagation();el.dataset.kleenestMigrated='1';setBusy(el,true);
    try{const last=typeof KleenestRewards?.lastCheckIn==='function'?KleenestRewards.lastCheckIn():null;const checkInId=last?.location_id===location.id?last.id:null;const cleanliness=Number.isFinite(Number(location.cleanlinessPct))&&Number(location.cleanlinessPct)>0?Number(location.cleanlinessPct):null;const created=await KleenestReviews.create(location.id,checkInId,stars,cleanliness,text);const reward=await KleenestRewards.syncReview(created.id);emit('kleenest:review-live',{review:created,locationId:location.id,checkInId,amenities,reward});alert('✓ Review saved. Your rewards were synchronized from Supabase.');if(typeof render==='function')render();}catch(error){emit('kleenest:action-error',{action:'review-create',error});alert(error?.message||'The review could not be saved to Supabase.');}finally{el.dataset.kleenestMigrated='0';setBusy(el,false);}
  },true);
  window.KleenestUI.run=function(action,params){params=params||{};if(action==='signout')return KleenestRuntime.signOut();if(action==='notification-read')return KleenestActions.markNotificationRead(params.notificationId);if(action==='redeem-promotion')return KleenestActions.redeemPromotion(params.promotionId,params.locationId);if(action==='reply-review')return KleenestActions.replyToReview(params.reviewId,params.reply);if(action==='checkin')return KleenestActions.checkIn(params.qrCode,params.latitude,params.longitude);throw new Error('Unknown Kleenest UI action: '+action);};
  window.KleenestUI.authReady=function(){return !!(window.KleenestRuntime&&window.KleenestRuntime.supabaseReady&&window.KleenestRuntime.supabaseReady());};
})();