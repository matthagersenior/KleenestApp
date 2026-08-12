/* Shared Kleenest live-state coordinator. Keeps extracted UI modules independent of the monolith. */
(function(){'use strict';
  const ui=window.KleenestUI=window.KleenestUI||{};
  let pending=null;
  async function refresh(reason){
    if(pending)return pending;
    pending=(async()=>{
      const detail={reason:reason||'refresh'};
      try{
        const jobs=[];
        if(typeof ui.loadBusinessState==='function')jobs.push(ui.loadBusinessState(detail.reason));
        if(typeof ui.loadAccountState==='function')jobs.push(ui.loadAccountState(detail.reason));
        if(typeof ui.loadRewardsHistory==='function')jobs.push(ui.loadRewardsHistory(detail.reason));
        await Promise.allSettled(jobs);
        window.dispatchEvent(new CustomEvent('kleenest:live-state-refreshed',{detail}));
        return detail;
      }finally{pending=null;}
    })();
    return pending;
  }
  ui.refreshLiveState=refresh;
  window.KleenestLiveState={refresh};
  window.addEventListener('kleenest:consumer-action-complete',e=>refresh(e.detail?.action||'consumer-action').catch(()=>{}));
  window.addEventListener('kleenest:business-mutated',()=>refresh('business-mutated').catch(()=>{}));
})();