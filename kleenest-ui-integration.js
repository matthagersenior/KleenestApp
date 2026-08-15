/* Production modular runtime loader. index.html is presentation-only; modules own behavior. */
(function(){'use strict';
window.KleenestUI=window.KleenestUI||{};
function emit(name,detail){if(window.KleenestEvents?.emit)return window.KleenestEvents.emit(name,detail);return window.dispatchEvent(new CustomEvent(name,{detail:detail||{}}));}
function loadScript(src,required=true){return new Promise((resolve,reject)=>{const existing=document.querySelector('script[data-kleenest-asset="'+src+'"]');if(existing)return resolve(existing);const el=document.createElement('script');el.src=src;el.async=false;el.dataset.kleenestAsset=src;el.onload=()=>resolve(el);el.onerror=()=>{const e=new Error('Failed to load '+src);if(required)reject(e);else{emit('kleenest:module-load-error',{src,error:e});resolve(null);}};document.head.appendChild(el);});}
function loadStyle(src){return new Promise((resolve,reject)=>{const existing=document.querySelector('link[data-kleenest-asset="'+src+'"]');if(existing)return resolve(existing);const el=document.createElement('link');el.rel='stylesheet';el.href=src;el.dataset.kleenestAsset=src;el.onload=()=>resolve(el);el.onerror=()=>reject(new Error('Failed to load '+src));document.head.appendChild(el);});}
async function ensureAssets(){
 const core=['https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js','kleenest-supabase.js','kleenest-auth.js','kleenest-auth-signup-controller.js','kleenest-runtime.js','kleenest-events.js','kleenest-navigation.js','kleenest-location.js','kleenest-map-discovery-bootstrap.js','kleenest-app-bootstrap.js','kleenest-modular-surface-orchestrator.js'];
 for(const src of core)await loadScript(src,true);
 const features=['kleenest-maps-compat.js','kleenest-actions.js','kleenest-action-dispatcher.js','kleenest-consumer-ui.js','kleenest-ui-actions.js','kleenest-business-actions.js','kleenest-business-action-dispatcher.js','kleenest-business-render.js','kleenest-reviews.js','kleenest-promotions.js','kleenest-account-state.js','kleenest-account.js','kleenest-account-ui.js','kleenest-business-management.js','kleenest-rewards.js','kleenest-gamification.js','kleenest-social.js','kleenest-community-ui.js','kleenest-extracted-modules.js','kleenest-surface-actions.js','kleenest-platform-adapter.js','kleenest-premium-entitlement.js','kleenest-premium-engagement.js','kleenest-enterprise-partner-intelligence.js','kleenest-partner-campaigns.js','kleenest-partner-allocation.js','kleenest-demo-environment.js','kleenest-modal-interaction-guard.js','kleenest-auth-modal-touch-fix.js','kleenest-auth-modal-hardening.js'];
 const failed=[];for(const src of features){const loaded=await loadScript(src,false);if(!loaded)failed.push(src);}try{await loadStyle('kleenest-business-ui.css');await loadScript('kleenest-business-ui.js',false);}catch(error){emit('kleenest:module-load-error',{src:'business-ui',error});}
 window.KleenestUI.moduleHealth={core:'ready',failed,loaded:features.filter(x=>!failed.includes(x))};emit('kleenest:module-health',window.KleenestUI.moduleHealth);
}
function mapRefresh(reason){return window.KleenestMapDiscovery?.load?.(reason||'maps')||Promise.resolve({status:'waiting_for_location'});}
const maps={init:()=>mapRefresh('init'),load:()=>mapRefresh('load'),refresh:()=>mapRefresh('refresh'),updateLocation:()=>mapRefresh('update-location'),open:()=>{window.KleenestNavigation?.activate?.('map');return mapRefresh('open');}};
window.maps=window.maps||maps;window.KleenestMaps=window.KleenestMaps||maps;
window.KleenestUI.refreshLiveState=async reason=>window.KleenestLiveState?.refresh?.(reason)||null;
window.KleenestUI.loadAccountState=async reason=>window.KleenestAccountState?.load?.(reason)||null;
window.KleenestUI.loadBusinessState=async reason=>window.KleenestBusinessState?.loadForCurrentUser?.(reason)||null;
window.KleenestUI.loadRewardsHistory=async reason=>window.KleenestRewardsHistory?.load?.(50,reason)||null;
async function boot(){try{await ensureAssets();window.KleenestAuthSignup?.bindAll?.();await window.KleenestAppBootstrap?.start?.();await mapRefresh('startup');await window.KleenestModularSurfaceOrchestrator?.start?.();}catch(error){window.KleenestUI.reportError?.('runtime-assets',error);console.error('Kleenest startup error',error);}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
