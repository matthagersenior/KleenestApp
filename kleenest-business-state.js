/* Kleenest business live-state synchronization layer. */
(function(){'use strict';
 const state=window.KleenestBusinessState=window.KleenestBusinessState||{};
 async function requireSession(){const session=window.KleenestSupabase?.session?await window.KleenestSupabase.session():window.KleenestAuth?.get?.()||await window.KleenestAuth?.getSession?.();if(!session)throw new Error('Please sign in to continue.');return session;}
 async function loadState(businessId,start,end){
  if(!businessId)throw new Error('A business ID is required.');await requireSession();const data=window.KleenestBusinessData;if(!data)throw new Error('Business data layer is not ready.');
  const [dashboardData,locs,reviewData,promos]=await Promise.all([data.dashboard(businessId,start,end),data.locations(businessId),data.recentReviews(businessId,50),data.promotions(businessId)]);
  const members=await data.memberships();const businessMembers=members.filter(m=>String(m.business_id)===String(businessId));
  let preferred=null;try{preferred=await window.kleenestBusinessAnalytics?.preferredAnalytics?.(businessId,start,end)||null;}catch(error){window.KleenestUI?.reportError?.('preferred-analytics-refresh',error);}
  const result={businessId,dashboard:dashboardData,members:businessMembers,locations:locs,reviews:reviewData,promotions:promos,preferredAnalytics:preferred,loadedAt:new Date().toISOString()};
  window.KleenestEvents?.emit?.('business-state-loaded',result)||window.dispatchEvent(new CustomEvent('kleenest:business-state-loaded',{detail:result}));return result;
 }
 state.loadState=loadState;
 state.loadForCurrentUser=async function(start,end){await requireSession();const data=window.KleenestBusinessData;if(!data)throw new Error('Business data layer is not ready.');const memberships=await data.memberships();const ids=[...new Set((memberships||[]).map(x=>x.business_id).filter(Boolean))];const businesses=[];for(const id of ids)businesses.push(await loadState(id,start,end));const result={businesses,loadedAt:new Date().toISOString()};window.KleenestEvents?.emit?.('business-state-collection-loaded',result)||window.dispatchEvent(new CustomEvent('kleenest:business-state-collection-loaded',{detail:result}));return result;};
 window.KleenestUI=window.KleenestUI||{};window.KleenestUI.loadBusinessState=state.loadForCurrentUser;
 window.addEventListener('kleenest:auth-state-changed',e=>{if(e.detail?.session)state.loadForCurrentUser().catch(error=>window.KleenestUI?.reportError?.('business-state-auth-refresh',error));});
})();
