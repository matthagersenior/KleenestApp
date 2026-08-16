/* Kleenest application bootstrap coordinator. */
(function(){'use strict';
  const api=window.KleenestAppBootstrap=window.KleenestAppBootstrap||{};
  let started=false;
  async function start(){
    if(started)return;
    started=true;
    try{
      const media=await import('./cores/media/kleenest-media-core.js');
      window.KleenestMediaCore=media;
      window.KleenestMediaCoreContract=media.mediaCoreContract;
      window.dispatchEvent(new CustomEvent('kleenest:media-core-ready',{detail:{core:media,contract:media.mediaCoreContract}}));
      window.KleenestNavigation?.init?.();
      if(window.KleenestUI?.refreshLiveState) await window.KleenestUI.refreshLiveState('app-bootstrap');
      window.dispatchEvent(new CustomEvent('kleenest:app-ready',{detail:{timestamp:Date.now(),mediaCore:media.mediaCoreContract.version}}));
    }catch(error){
      window.dispatchEvent(new CustomEvent('kleenest:action-error',{detail:{action:'app-bootstrap',error}}));
    }
  }
  api.start=start;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();