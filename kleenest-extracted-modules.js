/* Kleenest extracted-module loader. Loaded after the shared runtime so account, notifications, rewards, and live-state modules are available together. */
(function(){'use strict';
  const assets=['kleenest-rewards-history.js','kleenest-live-state.js','kleenest-account-state.js','kleenest-account-ui.js','kleenest-notifications-ui.js'];
  function load(src){return new Promise((resolve,reject)=>{if(document.querySelector('script[data-kleenest-extracted="'+src+'"]'))return resolve();const s=document.createElement('script');s.dataset.kleenestExtracted=src;s.src=src;s.async=false;s.onload=resolve;s.onerror=()=>reject(new Error('Failed to load '+src));document.head.appendChild(s);});}
  async function boot(){for(const src of assets)await load(src);window.KleenestUI?.refreshLiveState?.('extracted-modules-ready');}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();