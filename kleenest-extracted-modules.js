/* Kleenest extracted-module loader. Loaded after the shared runtime so state and UI modules are available together. */
(function(){'use strict';
  const assets=[
    'kleenest-business.js','kleenest-business-state.js','kleenest-rewards-history.js','kleenest-live-state.js','kleenest-account-state.js','kleenest-account-ui.js','kleenest-notifications-ui.js',
    'kleenest-customer-programs.js','kleenest-partner-access.js','kleenest-program-scope.js','kleenest-fleet-enterprise.js','kleenest-preferred-visit.js','kleenest-visit-tracking.js',
    'kleenest-business-analytics.js','kleenest-partner-program-admin.js','kleenest-enrollment.js','kleenest-benefit-swap.js','kleenest-preferred-history.js',
    'kleenest-business-program-panel.js','kleenest-business-analytics-panel.js','kleenest-benefit-center.js','kleenest-program-scope-panel.js','kleenest-acceptance-checks.js','kleenest-production-checklist.js'
  ];
  function load(src){return new Promise((resolve,reject)=>{if(document.querySelector('script[data-kleenest-extracted="'+src+'"]'))return resolve();const s=document.createElement('script');s.dataset.kleenestExtracted=src;s.src=src;s.async=false;s.onload=resolve;s.onerror=()=>reject(new Error('Failed to load '+src));document.head.appendChild(s);});}
  async function boot(){for(const src of assets){try{await load(src);}catch(e){console.warn('[Kleenest extracted modules]',e.message);}}window.KleenestUI?.refreshLiveState?.('extracted-modules-ready');}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();