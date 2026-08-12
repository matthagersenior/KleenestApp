/* Kleenest application bootstrap coordinator. */
(function(){'use strict';
  const api=window.KleenestAppBootstrap=window.KleenestAppBootstrap||{};
  let started=false;
  async function start(){
    if(started)return;
    started=true;
    try{
      if(window.KleenestUI?.refreshLiveState) await window.KleenestUI.refreshLiveState('app-bootstrap');
      window.dispatchEvent(new CustomEvent('kleenest:app-ready',{detail:{timestamp:Date.now()}}));
    }catch(error){
      window.dispatchEvent(new CustomEvent('kleenest:action-error',{detail:{action:'app-bootstrap',error}}));
    }
  }
  api.start=start;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();