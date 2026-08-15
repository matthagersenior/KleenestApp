/* Production modular surface orchestrator. The shell stays thin; feature modules own behavior. */
(function(){'use strict';
 const O=window.KleenestModularSurfaceOrchestrator=window.KleenestModularSurfaceOrchestrator||{};
 let started=false;
 const run=async(name,fn)=>{try{return await Promise.resolve(fn?.());}catch(error){window.dispatchEvent(new CustomEvent('kleenest:surface-error',{detail:{surface:name,error}}));return null;}};
 O.start=async()=>{if(started)return;started=true;
   await run('account',()=>window.KleenestAccountState?.load?.('modular-shell'));
   await run('location',()=>window.KleenestLocation?.init?.());
   await run('map',()=>window.KleenestMapDiscovery?.load?.('modular-shell'));
   await run('rewards',()=>window.KleenestRewardsHistory?.load?.(50,'modular-shell'));
   await run('gamification',()=>window.KleenestGamification?.init?.());
   await run('social',()=>window.KleenestSocial?.init?.());
   await run('business',()=>window.KleenestBusinessState?.loadForCurrentUser?.('modular-shell'));
   await run('community',()=>window.KleenestCommunityUI?.init?.());
   await run('partners',()=>window.KleenestEnterprisePartnerIntelligence?.init?.());
   window.dispatchEvent(new CustomEvent('kleenest:modular-surfaces-ready',{detail:{timestamp:Date.now()}}));
 };
 document.addEventListener('kleenest:app-ready',()=>O.start(),{once:true});
})();
