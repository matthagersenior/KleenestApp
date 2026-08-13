/* Business dashboard controller. Uses the existing analytics/program bridges and emits UI events. */
(function(){'use strict';
 async function load(businessId){
  if(!businessId)throw new Error('Business ID required.');
  const [analytics,programs]=await Promise.all([
   window.kleenestBusinessAnalytics?.get?window.kleenestBusinessAnalytics.get(businessId):[],
   window.kleenestPartnerPrograms?.list?window.kleenestPartnerPrograms.list():[]
  ]);
  const summary=window.kleenestBusinessAnalytics?.summarize?window.kleenestBusinessAnalytics.summarize(analytics):{};
  const model={businessId,summary,analytics:analytics||[],programs:(programs||[]).filter(p=>String(p.business_id)===String(businessId))};
  window.dispatchEvent(new CustomEvent('kleenest:business-dashboard-ready',{detail:model}));
  return model;
 }
 function mount(root,businessId){
  if(!root)return;
  root.addEventListener('click',async e=>{const b=e.target.closest?.('[data-business-dashboard-refresh]');if(!b)return;b.disabled=true;try{const model=await load(businessId);root.dispatchEvent(new CustomEvent('kleenest:business-dashboard-updated',{bubbles:true,detail:model}));}catch(err){root.dispatchEvent(new CustomEvent('kleenest:business-dashboard-error',{bubbles:true,detail:err}));}finally{b.disabled=false;}});
 }
 window.kleenestBusinessDashboard={load,mount};
})();
