/* Kleenest application bootstrap coordinator. */
(function(){'use strict';
  const api=window.KleenestAppBootstrap=window.KleenestAppBootstrap||{};
  let started=false;
  const withTimeout=(promise,ms)=>Promise.race([
    Promise.resolve(promise),
    new Promise(resolve=>setTimeout(()=>resolve(null),ms))
  ]);
  async function start(){
    if(started)return;
    started=true;
    try{
      window.KleenestNavigation?.init?.();
      // Live-state/network hydration must never prevent the shell from loading.
      // A slow/offline Supabase request previously left the app stranded mid-startup.
      if(window.KleenestUI?.refreshLiveState){
        try{ await withTimeout(window.KleenestUI.refreshLiveState('app-bootstrap'),4000); }
        catch(error){ window.dispatchEvent(new CustomEvent('kleenest:action-error',{detail:{action:'live-state-refresh',error}})); }
      }
      window.dispatchEvent(new CustomEvent('kleenest:app-ready',{detail:{timestamp:Date.now()}}));
    }catch(error){
      window.dispatchEvent(new CustomEvent('kleenest:action-error',{detail:{action:'app-bootstrap',error}}));
    }
  }
  api.start=start;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
