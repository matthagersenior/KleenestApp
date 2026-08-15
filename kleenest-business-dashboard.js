/* Business dashboard controller. Dataset detail is loaded by the selected dataset, never substituted. */
(function(){'use strict';
 async function load(businessId,start,end){
  if(!businessId)throw new Error('Business ID required.');
  const analytics=await window.kleenestBusinessAnalytics?.get?.(businessId,start,end)||[];
  const programs=await window.kleenestPartnerPrograms?.list?.()||[];
  const model={businessId,analytics,programs:(programs||[]).filter(p=>String(p.business_id)===String(businessId)),getDataset:key=>(analytics||[]).find(x=>x.key===key)||null};
  window.dispatchEvent(new CustomEvent('kleenest:business-dashboard-ready',{detail:model}));
  return model;
 }
 async function loadDataset(businessId,key,start,end){
  if(!businessId)throw new Error('Business ID required.');
  return window.kleenestBusinessAnalytics.datasetWithDetails(businessId,key,start,end);
 }
 function mount(root,businessId){
  if(!root)return;
  root.addEventListener('click',async e=>{const b=e.target.closest?.('[data-business-dashboard-refresh]');if(!b)return;b.disabled=true;try{const model=await load(businessId);root.dispatchEvent(new CustomEvent('kleenest:business-dashboard-updated',{bubbles:true,detail:model}));}catch(err){root.dispatchEvent(new CustomEvent('kleenest:business-dashboard-error',{bubbles:true,detail:err}));}finally{b.disabled=false;}});
 }
 window.kleenestBusinessDashboard={load,loadDataset,mount};
})();