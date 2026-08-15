/* Business feature integration bridge: only load verified feature modules. */
(function(g){'use strict';
if(g.__KLEENEST_BUSINESS_FEATURE_LOADER__)return;
g.__KLEENEST_BUSINESS_FEATURE_LOADER__=true;
const load=src=>new Promise((ok,no)=>{const base=src.split('?')[0];if(document.querySelector('script[src^="'+base+'"]'))return ok();const s=document.createElement('script');s.src=src;s.async=false;s.onload=ok;s.onerror=()=>no(Error('Unable to load '+src));document.head.appendChild(s)});
async function boot(){
 try{
  if(g.KleenestFeatureLoaders?.loadBusiness)await g.KleenestFeatureLoaders.loadBusiness();else return setTimeout(boot,150);
  await load('kleenest-qr.js?business-qr=complete-v8');
  await load('kleenest-business-admin-complete.js?business-admin=complete-v8');
  g.dispatchEvent(new CustomEvent('kleenest:business-features-ready'));
 }catch(e){console.error('[Kleenest] Business feature stack failed to load',e)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(window);