/* Business feature integration bridge: loads the complete previously-built Business feature stack. */
(function(g){'use strict';
 if(g.__KLEENEST_BUSINESS_FEATURE_LOADER__)return;
 g.__KLEENEST_BUSINESS_FEATURE_LOADER__=true;
 const load=src=>new Promise((ok,no)=>{if(document.querySelector('script[src^="'+src.split('?')[0]+'"]'))return ok();const s=document.createElement('script');s.src=src;s.async=false;s.onload=ok;s.onerror=()=>no(Error('Unable to load '+src));document.head.appendChild(s)});
 async function boot(){
   try{
     if(g.KleenestFeatureLoaders?.loadBusiness) await g.KleenestFeatureLoaders.loadBusiness();
     else return setTimeout(boot,150);
     await load('kleenest-qr.js?business-qr=complete-v2');
     await load('kleenest-business-admin-complete.js?business-admin=complete-v2');
     await load('kleenest-business-advanced-controls.js?business-features=complete-v2');
     console.info('[Kleenest] Complete Business feature stack wired: all datasets, location context, CRUD, QR Studio, campaigns, contests, events, promotions, QR/media and admin operations.');
     g.dispatchEvent(new CustomEvent('kleenest:business-features-ready'));
   }catch(e){console.error('[Kleenest] Business feature stack failed to load',e)}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>boot());else boot();
})(window);
