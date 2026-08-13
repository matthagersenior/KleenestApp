/* Kleenest UI integration bridge. */
(function(){'use strict';window.KleenestUI=window.KleenestUI||{};function emit(name,detail){if(window.KleenestEvents?.emit)return window.KleenestEvents.emit(name,detail);return window.dispatchEvent(new CustomEvent(name,{detail:detail||{}}));}function loadAsset(kind,src){return new Promise((resolve,reject)=>{const selector=kind==='script'?'script[data-kleenest-asset="'+src+'"]':'link[data-kleenest-asset="'+src+'"]';const existing=document.querySelector(selector);if(existing)return resolve(existing);const el=document.createElement(kind);el.dataset.kleenestAsset=src;if(kind==='script'){el.src=src;el.async=false;}else{el.rel='stylesheet';el.href=src;}el.onload=()=>resolve(el);el.onerror=()=>reject(new Error('Failed to load '+src));document.head.appendChild(el);});}
async function ensureAssets(){const scripts=['https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js','kleenest-supabase.js','kleenest-auth.js','kleenest-runtime.js','kleenest-actions.js','kleenest-action-dispatcher.js','kleenest-consumer-ui.js','kleenest-ui-actions.js','kleenest-business-actions.js','kleenest-business-action-dispatcher.js','kleenest-business-render.js','kleenest-extracted-modules.js','kleenest-navigation.js','kleenest-location.js','kleenest-events.js','kleenest-monolith-audit.js','kleenest-app-bootstrap.js','kleenest-gamification.js','kleenest-social.js','kleenest-community-ui.js'];for(const src of scripts)await loadAsset('script',src);try{await loadAsset('link','kleenest-business-ui.css');await loadAsset('script','kleenest-business-ui.js');}catch(error){emit('action-error',{action:'business-ui-assets',error});}}
window.KleenestUI.refreshLiveState=async reason=>window.KleenestLiveState?.refresh?.(reason)||null;
window.KleenestUI.loadAccountState=async reason=>window.KleenestAccountState?.load?.(reason)||null;
window.KleenestUI.loadBusinessState=async reason=>window.KleenestBusinessState?.loadForCurrentUser?.(reason)||null;
window.KleenestUI.loadRewardsHistory=async reason=>window.KleenestRewardsHistory?.load?.(50,reason)||null;
window.KleenestUI.loadGamification=async root=>window.KleenestCommunityUI?.renderGamification?.(root)||null;
window.KleenestUI.loadCommunity=async root=>window.KleenestCommunityUI?.renderSocial?.(root)||null;

// Modal interaction guard: overlay close markers must never treat clicks on modal children as backdrop clicks.
// The monolith/index currently uses delegated closest() handlers, so stop those clicks before they bubble.
function installModalInteractionGuard(){
  if(window.__kleenestModalInteractionGuardInstalled)return;
  window.__kleenestModalInteractionGuardInstalled=true;
  document.addEventListener('click',function(event){
    const overlay=event.target?.closest?.('.modal-overlay');
    if(!overlay)return;
    if(event.target===overlay)return;
    const modal=event.target?.closest?.('.modal-box');
    if(modal){event.stopPropagation();}
  },true);
}

async function boot(){try{await ensureAssets();installModalInteractionGuard();await window.KleenestAppBootstrap?.start?.();}catch(error){window.KleenestUI.reportError?.('runtime-assets',error);}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();})();
