/* Authoritative modular feature registry. Every path below exists on refactor/monolith-removal. */
(function(){'use strict';
 if(window.KleenestFeatureRegistry)return;
 const registry={
  core:'kleenest-supabase.js',
  events:'kleenest-events.js',
  runtime:'kleenest-runtime.js',
  location:'kleenest-location.js',
  maps:'kleenest-map-discovery-bootstrap.js',
  mapFilters:'kleenest-map-category-filters.js',
  mapCompat:'kleenest-maps-compat.js',
  reviews:'kleenest-reviews.js',
  rewards:'kleenest-rewards.js',
  rewardsHistory:'kleenest-rewards-history.js',
  engagement:'kleenest-engagement.js',
  qr:'kleenest-qr.js',
  business:'kleenest-business-workspace.js',
  businessAnalytics:'kleenest-business-analytics.js',
  businessAdmin:'kleenest-business-admin-complete.js',
  businessActions:'kleenest-business-actions.js',
  businessManagement:'kleenest-business-management.js',
  promotions:'kleenest-promotions.js',
  partners:'kleenest-partner-access.js',
  account:'kleenest-account.js',
  accountState:'kleenest-account-state.js',
  accountUI:'kleenest-account-ui.js'
 };
 const loaded={};
 function load(name){
  const src=registry[name];
  if(!src)return Promise.reject(new Error('Unknown Kleenest feature: '+name));
  if(loaded[name]||document.querySelector('script[data-kleenest-feature="'+name+'"]')){loaded[name]=true;return Promise.resolve();}
  return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src+'?modular=20260815-r6';s.dataset.kleenestFeature=name;s.async=false;s.onload=()=>{loaded[name]=true;resolve()};s.onerror=()=>reject(new Error('Unable to load '+name+' ('+src+')'));document.head.appendChild(s)});
 }
 window.KleenestFeatureRegistry={registry,loaded,load,loadMany:async names=>{for(const n of names)await load(n);}};
})();